import { useEffect, useRef, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa_install_dismissed_at'
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function isAlreadyInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

function wasDismissedRecently() {
  const ts = localStorage.getItem(DISMISSED_KEY)
  if (!ts) return false
  return Date.now() - parseInt(ts, 10) < DISMISS_TTL_MS
}

export function usePwaInstall() {
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Don't show if already installed or recently dismissed
    if (isAlreadyInstalled() || wasDismissedRecently()) {
      console.log('[PWA] Already installed or recently dismissed')
      return
    }

    console.log('[PWA] Listening for beforeinstallprompt event...')

    const handler = (e: Event) => {
      console.log('[PWA] beforeinstallprompt fired!')
      e.preventDefault()
      promptRef.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    // Fallback: if no beforeinstallprompt fires within 5s, show banner anyway for manual install info
    const timeout = setTimeout(() => {
      if (!promptRef.current) {
        console.log('[PWA] No beforeinstallprompt after 5s, enabling fallback banner')
        setCanInstall(true)
      }
    }, 5000)

    // Track successful install — hide banner
    const installed = () => setCanInstall(false)
    window.addEventListener('appinstalled', installed)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  async function triggerInstall() {
    if (!promptRef.current) return
    await promptRef.current.prompt()
    const { outcome } = await promptRef.current.userChoice
    if (outcome === 'accepted') {
      setCanInstall(false)
    }
    promptRef.current = null
  }

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setCanInstall(false)
  }

  return { canInstall, triggerInstall, dismiss }
}

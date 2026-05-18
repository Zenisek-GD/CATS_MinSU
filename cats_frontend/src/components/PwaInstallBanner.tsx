import { useEffect, useState } from 'react'
import { usePwaInstall } from './usePwaInstall'
import { Icon } from './IconMap'
import './PwaInstallBanner.css'

export function PwaInstallBanner() {
  const { canInstall, triggerInstall, dismiss } = usePwaInstall()
  const [visible, setVisible] = useState(false)

  // Small delay so it doesn't appear instantly on first render
  useEffect(() => {
    if (!canInstall) return
    const t = setTimeout(() => {
      console.log('[PWA Banner] Showing install prompt')
      setVisible(true)
    }, 1500)
    return () => clearTimeout(t)
  }, [canInstall])

  if (!visible) return null

  async function handleInstall() {
    setVisible(false)
    console.log('[PWA Banner] Install clicked')
    await triggerInstall()
  }

  function handleDismiss() {
    setVisible(false)
    console.log('[PWA Banner] Dismissed')
    dismiss()
  }

  return (
    <div className="pwaToast" role="dialog" aria-label="Install app">
      <button className="pwaClose" onClick={handleDismiss} aria-label="Dismiss">
        <Icon name="close" size={18} />
      </button>

      <div className="pwaRow">
        <div className="pwaText">
          <div className="pwaTitle">Install CyberAware</div>
          <div className="pwaSubtitle">Add to your home screen or install as an app.</div>
        </div>

        <div className="pwaActions">
          <button className="pwaBtnSecondary" onClick={handleDismiss}>Not now</button>
          <button className="pwaBtnPrimary" onClick={handleInstall}>
            <Icon name="download" size={16} /> Install
          </button>
        </div>
      </div>
    </div>
  )
}

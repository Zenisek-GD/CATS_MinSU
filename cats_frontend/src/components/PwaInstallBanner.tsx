import { useEffect, useState } from 'react'
import { usePwaInstall } from './usePwaInstall'
import { Icon } from './IconMap'
import './PwaInstallBanner.css'

/** Only show on touch / mobile devices */
function isMobileDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768
  )
}

export function PwaInstallBanner() {
  const { canInstall, triggerInstall, dismiss } = usePwaInstall()
  const [visible, setVisible] = useState(false)

  // Delay appearance by 3 s so it doesn't startle on first load
  useEffect(() => {
    if (!canInstall || !isMobileDevice()) return
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [canInstall])

  if (!visible) return null

  async function handleInstall() {
    setVisible(false)
    await triggerInstall()
  }

  function handleDismiss() {
    setVisible(false)
    dismiss()
  }

  return (
    <div className="pwaBackdrop" role="dialog" aria-modal="true" aria-label="Install app prompt">
      <div className="pwaBanner">
        {/* Close button */}
        <button className="pwaClose" onClick={handleDismiss} aria-label="Dismiss">
          <Icon name="close" size={18} />
        </button>

        {/* App icon */}
        <div className="pwaIconWrap">
          <img src="/cats logo.png" alt="CyberAware" className="pwaIcon" />
        </div>

        {/* Text */}
        <h2 className="pwaTitle">Install CyberAware</h2>
        <p className="pwaSubtitle">
          Add to your home screen for faster access — works offline too!
        </p>

        {/* Feature chips */}
        <div className="pwaFeatures">
          <span className="pwaChip"><Icon name="bolt" size={14} /> Faster access</span>
          <span className="pwaChip"><Icon name="wifi_off" size={14} /> Works offline</span>
          <span className="pwaChip"><Icon name="notifications" size={14} /> Push alerts</span>
        </div>

        {/* Actions */}
        <div className="pwaActions">
          <button className="pwaBtnSecondary" onClick={handleDismiss}>
            Not now
          </button>
          <button className="pwaBtnPrimary" onClick={handleInstall}>
            <Icon name="download" size={16} /> Install App
          </button>
        </div>
      </div>
    </div>
  )
}

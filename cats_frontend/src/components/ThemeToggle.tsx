import { useTheme } from './ThemeProvider'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const getIcon = () => {
    if (theme === 'light') return 'light_mode'
    if (theme === 'dark') return 'dark_mode'
    return 'brightness_auto'
  }

  return (
    <button 
      className="themeToggleBtn" 
      onClick={cycleTheme}
      title={`Current theme: ${theme}. Click to change.`}
    >
      <span className="material-symbols-outlined">{getIcon()}</span>
    </button>
  )
}

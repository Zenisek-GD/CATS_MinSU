import * as MdIcons from 'react-icons/md'
import type { ComponentType, SVGProps } from 'react'

type IconProps = SVGProps<SVGElement> & { title?: string; className?: string; size?: number | string }

/**
 * Maps Material Symbol icon names to React Icons components
 */
export const ICON_MAP: Record<string, ComponentType<IconProps>> = {
  add: MdIcons.MdAdd,
  admin_panel_settings: MdIcons.MdAdminPanelSettings,
  arrow_back: MdIcons.MdArrowBack,
  arrow_forward: MdIcons.MdArrowForward,
  badge: MdIcons.MdBadge,
  badge_outline: MdIcons.MdOutlinedFlag,
  bug_report: MdIcons.MdBugReport,
  cancel: MdIcons.MdCancel,
  check_circle: MdIcons.MdCheckCircle,
  chevron_right: MdIcons.MdChevronRight,
  close: MdIcons.MdClose,
  dashboard: MdIcons.MdDashboard,
  description: MdIcons.MdDescription,
  done_all: MdIcons.MdDoneAll,
  edit_note: MdIcons.MdEditNote,
  email: MdIcons.MdEmail,
  emoji_events: MdIcons.MdEmojiEvents,
  error: MdIcons.MdError,
  feedback: MdIcons.MdFeedback,
  filter_list: MdIcons.MdFilterList,
  gpp_bad: MdIcons.MdGppBad,
  group: MdIcons.MdGroup,
  help_outline: MdIcons.MdHelpOutline,
  info: MdIcons.MdInfo,
  lightbulb: MdIcons.MdLightbulb,
  link: MdIcons.MdLink,
  logout: MdIcons.MdLogout,
  mail: MdIcons.MdMail,
  menu: MdIcons.MdMenu,
  menu_book: MdIcons.MdMenuBook,
  military_tech: MdIcons.MdMilitaryTech,
  person: MdIcons.MdPerson,
  person_add: MdIcons.MdPersonAdd,
  phishing: MdIcons.MdSecurityUpdate,
  quiz: MdIcons.MdQuiz,
  school: MdIcons.MdSchool,
  search: MdIcons.MdSearch,
  security: MdIcons.MdSecurity,
  shield_person: MdIcons.MdShield,
  star: MdIcons.MdStar,
  star_outline: MdIcons.MdStarOutline,
  tag: MdIcons.MdLabel,
  touch_app: MdIcons.MdTouchApp,
  trending_down: MdIcons.MdTrendingDown,
  trending_up: MdIcons.MdTrendingUp,
  verified_user: MdIcons.MdVerifiedUser,
  vpn_key: MdIcons.MdVpnKey,
  warning: MdIcons.MdWarning,
  workspace_premium: MdIcons.MdWorkspacePremium,
  notifications_active: MdIcons.MdNotificationsActive,
  notifications: MdIcons.MdNotifications,
  light_mode: MdIcons.MdLightMode,
  dark_mode: MdIcons.MdDarkMode,
  brightness_auto: MdIcons.MdBrightnessAuto,
  lock_open: MdIcons.MdLockOpen,
  groups: MdIcons.MdGroups,
  devices: MdIcons.MdDevices,
  policy: MdIcons.MdPolicy,
  radio_button_checked: MdIcons.MdRadioButtonChecked,
  radio_button_unchecked: MdIcons.MdRadioButtonUnchecked,
  check_circle_outline: MdIcons.MdCheckCircleOutline,
  percent: MdIcons.MdPercent,
  insights: MdIcons.MdInsights,
  percent_outlined: MdIcons.MdPercent,
}

/**
 * Get an icon component by name
 * Falls back to MdQuestionMark if icon not found
 */
export function getIcon(iconName: string | undefined): ComponentType<IconProps> {
  if (!iconName) return MdIcons.MdQuestionMark
  return ICON_MAP[iconName] || MdIcons.MdQuestionMark
}

/**
 * Icon component wrapper
 */
export function Icon({
  name,
  size = 24,
  className = '',
  ariaHidden = true,
  ...props
}: {
  name: string | undefined
  size?: number | string
  className?: string
  ariaHidden?: boolean
  [key: string]: any
}) {
  const IconComponent = getIcon(name)
  return (
    <IconComponent
      fontSize={size}
      className={className}
      aria-hidden={ariaHidden}
      {...props}
    />
  )
}

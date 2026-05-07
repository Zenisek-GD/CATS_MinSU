import * as MdIcons from 'react-icons/md'
import type { ComponentType, SVGProps } from 'react'

type IconProps = SVGProps<SVGElement> & { title?: string; className?: string; size?: number | string }

/**
 * Maps Material Symbol icon names to React Icons components
 */
export const ICON_MAP: Record<string, ComponentType<IconProps>> = {
  add: MdIcons.MdAdd,
  admin_panel_settings: MdIcons.MdAdminPanelSettings,
  archive: MdIcons.MdArchive,
  arrow_back: MdIcons.MdArrowBack,
  arrow_forward: MdIcons.MdArrowForward,
  assessment: MdIcons.MdAssessment,
  assignment: MdIcons.MdAssignment,
  badge: MdIcons.MdBadge,
  badge_outline: MdIcons.MdOutlinedFlag,
  bar_chart: MdIcons.MdBarChart,
  bolt: MdIcons.MdBolt,
  brightness_auto: MdIcons.MdBrightnessAuto,
  broken_image: MdIcons.MdBrokenImage,
  bug_report: MdIcons.MdBugReport,
  calendar_today: MdIcons.MdCalendarToday,
  cancel: MdIcons.MdCancel,
  check: MdIcons.MdCheck,
  check_circle: MdIcons.MdCheckCircle,
  check_circle_outline: MdIcons.MdCheckCircleOutline,
  chevron_right: MdIcons.MdChevronRight,
  close: MdIcons.MdClose,
  content_copy: MdIcons.MdContentCopy,
  dark_mode: MdIcons.MdDarkMode,
  dashboard: MdIcons.MdDashboard,
  delete: MdIcons.MdDelete,
  delete_forever: MdIcons.MdDeleteForever,
  download: MdIcons.MdDownload,
  description: MdIcons.MdDescription,
  devices: MdIcons.MdDevices,
  done_all: MdIcons.MdDoneAll,
  edit: MdIcons.MdEdit,
  edit_note: MdIcons.MdEditNote,
  email: MdIcons.MdEmail,
  emoji_events: MdIcons.MdEmojiEvents,
  error: MdIcons.MdError,
  exit_to_app: MdIcons.MdExitToApp,
  feedback: MdIcons.MdFeedback,
  filter_list: MdIcons.MdFilterList,
  gpp_bad: MdIcons.MdGppBad,
  group: MdIcons.MdGroup,
  groups: MdIcons.MdGroups,
  help_outline: MdIcons.MdHelpOutline,
  history: MdIcons.MdHistory,
  hourglass_empty: MdIcons.MdHourglassEmpty,
  lock: MdIcons.MdLock,
  lock_open: MdIcons.MdLockOpen,
  info: MdIcons.MdInfo,
  insights: MdIcons.MdInsights,
  keyboard: MdIcons.MdKeyboard,
  keyboard_arrow_down: MdIcons.MdKeyboardArrowDown,
  keyboard_arrow_up: MdIcons.MdKeyboardArrowUp,
  library_books: MdIcons.MdLibraryBooks,
  light_mode: MdIcons.MdLightMode,
  lightbulb: MdIcons.MdLightbulb,
  link: MdIcons.MdLink,
  login: MdIcons.MdLogin,
  logout: MdIcons.MdLogout,
  mail: MdIcons.MdMail,
  manage_accounts: MdIcons.MdManageAccounts,
  menu: MdIcons.MdMenu,
  menu_book: MdIcons.MdMenuBook,
  military_tech: MdIcons.MdMilitaryTech,
  more_vert: MdIcons.MdMoreVert,
  notifications: MdIcons.MdNotifications,
  notifications_active: MdIcons.MdNotificationsActive,
  ondemand_video: MdIcons.MdOndemandVideo,
  percent: MdIcons.MdPercent,
  percent_outlined: MdIcons.MdPercent,
  person: MdIcons.MdPerson,
  person_add: MdIcons.MdPersonAdd,
  person_remove: MdIcons.MdPersonRemove,
  phishing: MdIcons.MdSecurityUpdate,
  play_arrow: MdIcons.MdPlayArrow,
  play_circle: MdIcons.MdPlayCircle,
  play_circle_outline: MdIcons.MdPlayCircleOutline,
  policy: MdIcons.MdPolicy,
  qr_code: MdIcons.MdQrCode,
  qr_code_scanner: MdIcons.MdQrCodeScanner,
  quiz: MdIcons.MdQuiz,
  radio_button_checked: MdIcons.MdRadioButtonChecked,
  radio_button_unchecked: MdIcons.MdRadioButtonUnchecked,
  refresh: MdIcons.MdRefresh,
  schedule: MdIcons.MdSchedule,
  school: MdIcons.MdSchool,
  search: MdIcons.MdSearch,
  security: MdIcons.MdSecurity,
  shield_person: MdIcons.MdShield,
  signal_cellular_alt: MdIcons.MdSignalCellularAlt,
  smart_display: MdIcons.MdOndemandVideo,
  smartphone: MdIcons.MdSmartphone,
  sort_by_alpha: MdIcons.MdSortByAlpha,
  star: MdIcons.MdStar,
  star_outline: MdIcons.MdStarOutline,
  tag: MdIcons.MdLabel,
  timer: MdIcons.MdTimer,
  touch_app: MdIcons.MdTouchApp,
  trending_down: MdIcons.MdTrendingDown,
  trending_up: MdIcons.MdTrendingUp,
  verified: MdIcons.MdVerified,
  verified_user: MdIcons.MdVerifiedUser,
  videocam_off: MdIcons.MdVideocamOff,
  video_library: MdIcons.MdVideoLibrary,
  vpn_key: MdIcons.MdVpnKey,
  warning: MdIcons.MdWarning,
  wifi_off: MdIcons.MdWifiOff,
  workspace_premium: MdIcons.MdWorkspacePremium,
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

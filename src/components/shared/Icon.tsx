import type { SVGProps } from 'react'

export type IconName =
  | 'search'
  | 'pin'
  | 'shield'
  | 'check'
  | 'message'
  | 'house'
  | 'eye'
  | 'sliders'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'chevron-down'
  | 'plus'
  | 'star'
  | 'phone'
  | 'wifi'
  | 'globe'
  | 'menu'
  | 'whatsapp'
  | 'bed'
  | 'ruler'
  | 'heart'
  | 'calendar'
  | 'help'
  | 'user'
  | 'building'
  | 'users'
  | 'door'
  | 'home-heart'
  | 'wallet'
  | 'flag-mg'
  | 'flag-fr'
  | 'facebook'
  | 'instagram'
  | 'tiktok'

type Props = {
  name: IconName
  size?: number
  stroke?: number
  className?: string
} & Omit<SVGProps<SVGSVGElement>, 'name' | 'size' | 'stroke'>

export function Icon({ name, size = 20, stroke = 1.8, className, ...rest }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
    ...rest,
  }

  switch (name) {
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )
    case 'pin':
      return (
        <svg {...common}>
          <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )
    case 'message':
      return (
        <svg {...common}>
          <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z" />
        </svg>
      )
    case 'house':
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M10 21v-6h4v6" />
        </svg>
      )
    case 'eye':
      return (
        <svg {...common}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'sliders':
      return (
        <svg {...common}>
          <path d="M4 6h10" />
          <path d="M18 6h2" />
          <circle cx="16" cy="6" r="2" />
          <path d="M4 12h2" />
          <path d="M10 12h10" />
          <circle cx="8" cy="12" r="2" />
          <path d="M4 18h12" />
          <path d="M20 18h0" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      )
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      )
    case 'arrow-up-right':
      return (
        <svg {...common}>
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      )
    case 'chevron-down':
      return (
        <svg {...common}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="m12 3 2.6 5.5 6 .9-4.4 4.2 1 6L12 16.8 6.8 19.6l1-6L3.4 9.4l6-.9L12 3Z" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...common}>
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
        </svg>
      )
    case 'wifi':
      return (
        <svg {...common}>
          <path d="M5 12.5a10 10 0 0 1 14 0" />
          <path d="M8.5 16a5 5 0 0 1 7 0" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
          <path d="M2 9a14 14 0 0 1 20 0" />
        </svg>
      )
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a13.5 13.5 0 0 1 0 18" />
          <path d="M12 3a13.5 13.5 0 0 0 0 18" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      )
    case 'whatsapp':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          aria-hidden
          className={className}
        >
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2Zm5.7 13.6c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.8-.6-3.2-1.4-5.2-4.6-5.4-4.8-.2-.2-1.3-1.7-1.3-3.2 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4.8-.4h.6c.2 0 .5 0 .7.5l1 2.3c.1.2.2.4 0 .6l-.3.4-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1.3.1 1.8.9 2.2 1 .3.2.5.3.6.4.1.2.1.9-.1 1.6Z" />
        </svg>
      )
    case 'bed':
      return (
        <svg {...common}>
          <path d="M3 18V8" />
          <path d="M3 14h18v4" />
          <path d="M21 18v-4a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3" />
          <circle cx="8" cy="11" r="2" />
        </svg>
      )
    case 'ruler':
      return (
        <svg {...common}>
          <path d="M3 17 17 3l4 4L7 21Z" />
          <path d="M7 7l2 2" />
          <path d="M10 4l2 2" />
          <path d="M13 7l2 2" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M8 3v4" />
          <path d="M16 3v4" />
        </svg>
      )
    case 'help':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4" />
          <circle cx="12" cy="17" r=".6" fill="currentColor" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )
    case 'building':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="1.5" />
          <path d="M9 7h2" />
          <path d="M13 7h2" />
          <path d="M9 11h2" />
          <path d="M13 11h2" />
          <path d="M9 15h2" />
          <path d="M13 15h2" />
          <path d="M10 21v-3h4v3" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3.2" />
          <path d="M3 19a6 6 0 0 1 12 0" />
          <circle cx="17" cy="8" r="2.6" />
          <path d="M15.5 13.5A5 5 0 0 1 21 18" />
        </svg>
      )
    case 'door':
      return (
        <svg {...common}>
          <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
          <path d="M4 21h16" />
          <circle cx="15" cy="13" r=".7" fill="currentColor" />
        </svg>
      )
    case 'home-heart':
      return (
        <svg {...common}>
          <path d="M3 11 12 4l9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M12 17.5s-3-1.6-3-3.6a1.8 1.8 0 0 1 3-1.2 1.8 1.8 0 0 1 3 1.2c0 2-3 3.6-3 3.6Z" />
        </svg>
      )
    case 'wallet':
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7H6a2 2 0 0 1 0-4h12" />
          <circle cx="17" cy="14" r="1.2" fill="currentColor" />
        </svg>
      )
    case 'flag-mg':
      return (
        <svg
          viewBox="0 0 30 20"
          width={size * 1.5}
          height={size}
          aria-hidden
          className={className}
        >
          <rect width="10" height="20" fill="#fff" />
          <rect x="10" width="20" height="10" fill="#fc3d32" />
          <rect x="10" y="10" width="20" height="10" fill="#007e3a" />
        </svg>
      )
    case 'flag-fr':
      return (
        <svg
          viewBox="0 0 30 20"
          width={size * 1.5}
          height={size}
          aria-hidden
          className={className}
        >
          <rect width="10" height="20" fill="#0055A4" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#EF4135" />
        </svg>
      )
    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          aria-hidden
          className={className}
        >
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34V22c4.78-.75 8.44-4.89 8.44-9.94Z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'tiktok':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill="currentColor"
          aria-hidden
          className={className}
        >
          <path d="M19.6 6.7a5.7 5.7 0 0 1-3.5-1.2 5.7 5.7 0 0 1-2.2-3.5h-3v13.4a2.5 2.5 0 1 1-2.5-2.5c.3 0 .5 0 .7.1V9.9a5.7 5.7 0 1 0 4.9 5.7V9.4a8.7 8.7 0 0 0 5.6 2V8.5l-.04-1.8Z" />
        </svg>
      )
    default:
      return null
  }
}

import { LOGO_PATH } from '../lib/logoPath'

/** The Coca-Cola Spencerian wordmark as an inline vector, cropped to its ink bounds. */
export default function Logo({ className = '', color = 'currentColor', title = 'Coca-Cola' }) {
  return (
    <svg viewBox="0 5.3 24 13.4" className={className} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
      <title>{title}</title>
      <path d={LOGO_PATH} fill={color} />
    </svg>
  )
}

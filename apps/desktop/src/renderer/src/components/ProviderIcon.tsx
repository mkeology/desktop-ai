import { BRAND_ICONS } from '../data/brandIcons'

interface ProviderIconProps {
  /** Provider/catalog id — looked up in BRAND_ICONS; falls back by label if absent. */
  id: string
  label: string
  /** Diameter in pixels. */
  size?: number
  className?: string
}

function initialsAvatar(label: string): { letter: string; hue: number } {
  let hash = 0
  for (const char of label) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return { letter: label.trim().charAt(0).toUpperCase(), hue: hash }
}

// A real brand mark when we have one (see data/brandIcons.ts), otherwise a
// deterministic colored-initial badge — used for custom user-added sites
// and the handful of providers with no available brand data (ChatGPT).
export function ProviderIcon({ id, label, size = 24, className }: ProviderIconProps) {
  const brand = BRAND_ICONS[id]
  const style = { width: size, height: size }

  if (brand) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full ${className ?? ''}`}
        style={{ ...style, backgroundColor: brand.hex }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="#fff">
          <path d={brand.path} />
        </svg>
      </span>
    )
  }

  const { letter, hue } = initialsAvatar(label)
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${className ?? ''}`}
      style={{ ...style, backgroundColor: `hsl(${hue}, 60%, 45%)` }}
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}

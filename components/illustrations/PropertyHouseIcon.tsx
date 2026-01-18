// Small house icon for property cards - varies by bedroom count

interface PropertyHouseIconProps {
  beds: number
  className?: string
}

export function PropertyHouseIcon({ beds, className }: PropertyHouseIconProps) {
  const baseClass = className || "w-16 h-16"

  if (beds >= 5) {
    // Large estate
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="28" width="48" height="28" className="fill-primary-600/20" rx="2" />
        <path d="M4 32 L32 12 L60 32" className="stroke-primary-600" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="26" y="38" width="12" height="18" className="fill-primary-600/30" rx="1" />
        <rect x="12" y="36" width="10" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="42" y="36" width="10" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="12" y="48" width="10" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="42" y="48" width="10" height="8" className="fill-primary-600/40" rx="1" />
      </svg>
    )
  } else if (beds >= 4) {
    // Two-story family home
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none">
        <rect x="12" y="24" width="40" height="32" className="fill-primary-600/20" rx="2" />
        <path d="M8 28 L32 10 L56 28" className="stroke-primary-600" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="26" y="40" width="12" height="16" className="fill-primary-600/30" rx="1" />
        <rect x="16" y="30" width="8" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="40" y="30" width="8" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="16" y="44" width="8" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="40" y="44" width="8" height="8" className="fill-primary-600/40" rx="1" />
      </svg>
    )
  } else {
    // Cozy cottage
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none">
        <rect x="14" y="30" width="36" height="26" className="fill-primary-600/20" rx="2" />
        <path d="M10 34 L32 14 L54 34" className="stroke-primary-600" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="26" y="40" width="12" height="16" className="fill-primary-600/30" rx="1" />
        <rect x="18" y="36" width="8" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="38" y="36" width="8" height="8" className="fill-primary-600/40" rx="1" />
      </svg>
    )
  }
}

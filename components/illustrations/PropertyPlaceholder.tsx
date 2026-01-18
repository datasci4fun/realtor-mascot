// Property placeholder SVG - varies by bedroom count

interface PropertyPlaceholderProps {
  beds: number
  className?: string
}

export function PropertyPlaceholder({ beds, className }: PropertyPlaceholderProps) {
  const baseClass = className || "w-full h-full"

  if (beds >= 5) {
    // Large estate
    return (
      <svg className={baseClass} viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" className="fill-primary-50" />
        <rect x="50" y="120" width="300" height="150" className="fill-primary-200" rx="4" />
        <path d="M30 140 L200 40 L370 140" className="stroke-primary-400" strokeWidth="8" strokeLinecap="round" fill="none" />
        <rect x="160" y="170" width="80" height="100" className="fill-primary-300" rx="2" />
        <rect x="70" y="160" width="60" height="50" className="fill-primary-300" rx="2" />
        <rect x="270" y="160" width="60" height="50" className="fill-primary-300" rx="2" />
        <rect x="70" y="220" width="60" height="50" className="fill-primary-300" rx="2" />
        <rect x="270" y="220" width="60" height="50" className="fill-primary-300" rx="2" />
        <text x="200" y="290" textAnchor="middle" className="fill-primary-500 text-sm font-medium">Large Estate</text>
      </svg>
    )
  } else if (beds >= 4) {
    // Two-story family home
    return (
      <svg className={baseClass} viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" className="fill-primary-50" />
        <rect x="80" y="100" width="240" height="170" className="fill-primary-200" rx="4" />
        <path d="M60 120 L200 30 L340 120" className="stroke-primary-400" strokeWidth="8" strokeLinecap="round" fill="none" />
        <rect x="160" y="180" width="80" height="90" className="fill-primary-300" rx="2" />
        <rect x="100" y="130" width="50" height="40" className="fill-primary-300" rx="2" />
        <rect x="250" y="130" width="50" height="40" className="fill-primary-300" rx="2" />
        <rect x="100" y="200" width="50" height="40" className="fill-primary-300" rx="2" />
        <rect x="250" y="200" width="50" height="40" className="fill-primary-300" rx="2" />
        <text x="200" y="290" textAnchor="middle" className="fill-primary-500 text-sm font-medium">Family Home</text>
      </svg>
    )
  } else {
    // Cozy cottage
    return (
      <svg className={baseClass} viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" className="fill-primary-50" />
        <rect x="100" y="130" width="200" height="140" className="fill-primary-200" rx="4" />
        <path d="M80 150 L200 60 L320 150" className="stroke-primary-400" strokeWidth="8" strokeLinecap="round" fill="none" />
        <rect x="165" y="190" width="70" height="80" className="fill-primary-300" rx="2" />
        <rect x="120" y="160" width="40" height="35" className="fill-primary-300" rx="2" />
        <rect x="240" y="160" width="40" height="35" className="fill-primary-300" rx="2" />
        <text x="200" y="290" textAnchor="middle" className="fill-primary-500 text-sm font-medium">Cozy Home</text>
      </svg>
    )
  }
}

// Hero section house illustration

export function HeroHouseIllustration() {
  return (
    <svg viewBox="0 0 400 350" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* House base */}
      <rect x="80" y="160" width="240" height="150" fill="white" fillOpacity="0.15" rx="4" />
      {/* Roof */}
      <path d="M60 170 L200 60 L340 170" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M80 170 L200 80 L320 170" fill="white" fillOpacity="0.2" />
      {/* Chimney */}
      <rect x="260" y="90" width="30" height="60" fill="white" fillOpacity="0.2" rx="2" />
      {/* Door */}
      <rect x="170" y="220" width="60" height="90" fill="white" fillOpacity="0.25" rx="4" />
      <circle cx="215" cy="270" r="5" fill="white" fillOpacity="0.4" />
      {/* Windows */}
      <rect x="100" y="200" width="50" height="40" fill="white" fillOpacity="0.3" rx="2" />
      <rect x="100" y="200" width="50" height="40" stroke="white" strokeOpacity="0.4" strokeWidth="2" rx="2" fill="none" />
      <line x1="125" y1="200" x2="125" y2="240" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="100" y1="220" x2="150" y2="220" stroke="white" strokeOpacity="0.4" strokeWidth="2" />

      <rect x="250" y="200" width="50" height="40" fill="white" fillOpacity="0.3" rx="2" />
      <rect x="250" y="200" width="50" height="40" stroke="white" strokeOpacity="0.4" strokeWidth="2" rx="2" fill="none" />
      <line x1="275" y1="200" x2="275" y2="240" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="250" y1="220" x2="300" y2="220" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
      {/* Ground */}
      <ellipse cx="200" cy="320" rx="160" ry="20" fill="white" fillOpacity="0.1" />
      {/* Decorative elements */}
      <circle cx="50" cy="100" r="20" fill="white" fillOpacity="0.1" />
      <circle cx="350" cy="80" r="15" fill="white" fillOpacity="0.1" />
      <circle cx="370" cy="200" r="25" fill="white" fillOpacity="0.08" />
    </svg>
  )
}

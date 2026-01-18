interface AreasServedProps {
  cities: string[]
}

export function AreasServed({ cities }: AreasServedProps) {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Texas outline background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <svg viewBox="0 0 800 800" className="w-full max-w-4xl h-auto">
          <path d="M200 100 L350 80 L400 100 L450 95 L550 120 L600 150 L650 200 L680 280 L700 350 L720 450 L700 550 L680 600 L620 680 L550 720 L450 700 L350 720 L250 700 L180 650 L150 550 L130 450 L100 350 L120 250 L150 180 Z"
            fill="currentColor"
            className="text-primary-600"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Service Area</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Serving the DFW Metroplex</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            From Plano to Fort Worth, Little Elm to Waxahachie — helping families find their perfect home across North Texas.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {cities.map((city, index) => (
            <span
              key={city}
              className="bg-primary-50 text-primary-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-100 hover:shadow-md transition-all cursor-default border border-primary-100"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

import { ProcessStep } from '@/data/process-steps'

interface ProcessTimelineProps {
  steps: ProcessStep[]
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">The Process</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Your Home Buying Journey</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">A simple, guided process from first consultation to getting your keys</p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden md:block relative">
          {/* Timeline line */}
          <div className="absolute top-12 left-0 right-0 h-1 timeline-line rounded-full"></div>

          <div className="grid grid-cols-4 gap-8 relative">
            {steps.map((step) => (
              <div key={step.step} className="text-center relative">
                {/* Step circle */}
                <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center relative z-10 border-4 border-primary-100">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-primary-200 mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-8">
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

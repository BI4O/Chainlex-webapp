'use client';

import { useLexstudioStore } from '@/lib/store';

const WHITEPAPER_STEPS = [
  'Asset Onboarding',
  'Valuation',
  'Yield Design',
  'Legal Structure',
  'Compliance',
  'Tokenomics',
  'Final Review',
];

const CONTRACT_STEPS = [
  'Standard Select',
  'Minting Logic',
  'Transfer Rules',
  'Compliance Integration',
  'Oracle Integration',
  'Testing',
  'Final Review',
];

export function MilestoneTracker() {
  const phase = useLexstudioStore((state) => state.phase);
  const currentStep = useLexstudioStore((state) => state.currentStep);
  const completedSteps = useLexstudioStore((state) => state.completedSteps);
  const setCurrentStep = useLexstudioStore((state) => state.setCurrentStep);

  const steps = phase === 'whitepaper' ? WHITEPAPER_STEPS : CONTRACT_STEPS;

  return (
    <div>
      {/* Progress Dots */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((_, index) => (
          <div key={index} className="flex items-center">
            {/* Dot */}
            <button
              onClick={() => setCurrentStep(index)}
              className={`
                w-6 h-6 flex items-center justify-center rounded-full
                border-2 transition-all duration-200
                hover:scale-110
                ${completedSteps.includes(index)
                  ? 'bg-[#324998] border-[#324998] text-white shadow-sm'
                  : 'bg-white border-[#324998] text-[#324998] shadow-sm'
                }
                ${currentStep === index
                  ? 'ring-2 ring-[#324998] ring-offset-2 ring-offset-[#f0f2f5] shadow-md'
                  : ''
                }
              `}
            >
              {completedSteps.includes(index) ? '●' : '○'}
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-[#E5E7EB] mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Label */}
      <div className="font-body text-sm font-medium text-center text-[#324998]">
        Step {currentStep + 1}/7: {steps[currentStep]}
      </div>
    </div>
  );
}

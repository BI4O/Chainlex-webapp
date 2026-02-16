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
                w-6 h-6 flex items-center justify-center
                border-2 border-foreground
                transition-all duration-200
                hover:scale-110
                ${completedSteps.includes(index)
                  ? 'bg-foreground text-background'
                  : 'bg-background text-foreground'
                }
                ${currentStep === index ? 'ring-2 ring-foreground ring-offset-2' : ''}
              `}
            >
              {completedSteps.includes(index) ? '●' : '○'}
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-foreground mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Label */}
      <div className="font-mono text-xs uppercase tracking-widest text-center">
        Step {currentStep + 1}/7: {steps[currentStep]}
      </div>
    </div>
  );
}

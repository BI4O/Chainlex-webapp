'use client';

import { useLexstudioStore } from '@/lib/store';

const WHITEPAPER_STEPS = [
  'Executive Summary',
  'Issuer & Governance',
  'Token Overview & Classification',
  'Legal & Regulatory',
  'Tokenomics',
  'Fundraising & Use of Proceeds',
  'Technology & Security',
  'Listing & Trading',
  'Market Integrity & Disclosure',
  'Key Risks',
  'Incident Response & Delisting',
  'Declarations & Signatures',
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
    <div className="flex flex-col gap-1">
      {steps.map((stepName, index) => (
        <div key={index} className="flex items-stretch">
          {/* Left: dot + connector */}
          <div className="flex flex-col items-center mr-3 w-5">
            <button
              onClick={() => setCurrentStep(index)}
              className={`
                w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full
                border-2 transition-all duration-200 hover:scale-110
                ${completedSteps.includes(index)
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
                  : 'bg-white border-[var(--accent)] text-[var(--accent)] shadow-sm'
                }
                ${currentStep === index
                  ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background-canvas)] shadow-md'
                  : ''
                }
              `}
            >
              <span className="text-[8px] leading-none">
                {completedSteps.includes(index) ? '●' : '○'}
              </span>
            </button>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="w-0.5 flex-1 mt-1 bg-[#E5E7EB]" />
            )}
          </div>

          {/* Right: step label */}
          <div
            className={`
              pb-3 pt-0.5 font-body text-xs leading-tight cursor-pointer
              transition-colors duration-200
              ${currentStep === index
                ? 'text-[var(--accent)] font-semibold'
                : completedSteps.includes(index)
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-gray-400'
              }
            `}
            onClick={() => setCurrentStep(index)}
          >
            <span className="text-[10px] font-mono text-gray-400 mr-1">
              {String(index + 1).padStart(2, '0')}
            </span>
            {stepName}
          </div>
        </div>
      ))}
    </div>
  );
}

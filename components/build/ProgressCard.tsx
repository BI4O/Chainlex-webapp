'use client';

import { useLexstudioStore } from '@/lib/store';
import { useState } from 'react';

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

export function ProgressCard() {
  const phase = useLexstudioStore((state) => state.phase);
  const currentStep = useLexstudioStore((state) => state.currentStep);
  const completedSteps = useLexstudioStore((state) => state.completedSteps);
  const setCurrentStep = useLexstudioStore((state) => state.setCurrentStep);

  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = phase === 'whitepaper' ? WHITEPAPER_STEPS : CONTRACT_STEPS;
  const progress = ((completedSteps.length / steps.length) * 100).toFixed(0);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-200 px-5 py-4">
      {/* Phase Label */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Phase: {phase === 'whitepaper' ? 'Whitepaper' : 'Contract'}
        </span>
        <span className="font-body text-xs font-medium text-[#324998]">
          {progress}%
        </span>
      </div>

      {/* Linear Progress Bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[#324998] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Dots */}
      <div className="flex items-center justify-between mb-3 relative">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center relative">
            {/* Dot Button */}
            <button
              onClick={() => setCurrentStep(index)}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
              className={`
                w-5 h-5 flex items-center justify-center rounded-full
                transition-all duration-200
                hover:scale-110
                ${completedSteps.includes(index)
                  ? 'bg-[#324998] text-white shadow-sm'
                  : 'bg-white border-2 border-gray-300 text-gray-400'
                }
                ${currentStep === index
                  ? 'ring-2 ring-[#324998] ring-offset-2 ring-offset-white shadow-md'
                  : ''
                }
              `}
            >
              <span className="text-[9px] font-bold">
                {completedSteps.includes(index) ? '✓' : index + 1}
              </span>
            </button>

            {/* Tooltip */}
            {hoveredStep === index && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10">
                {step}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
              </div>
            )}

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="w-2 h-0.5 bg-gray-200 mx-0.5" />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Label */}
      <div className="text-center">
        <span className="font-body text-sm font-medium text-[#324998]">
          Step {currentStep + 1}/{steps.length}: {steps[currentStep]}
        </span>
      </div>
    </div>
  );
}

'use client';

import { useLexstudioStore } from '@/lib/store';
import { useState } from 'react';

export const UNIFIED_STEPS = [
  'Asset Identity',
  'Issuer & Legal',
  'Token Economics',
  'Legal & Compliance',
  'Valuation & Yield',
  'Token Classification',
  'Transfer & Minting',
  'Technology',
  'Market & Risks',
  'Final Review',
];

export function ProgressCard() {
  const currentStep = useLexstudioStore((state) => state.currentStep);
  const completedSteps = useLexstudioStore((state) => state.completedSteps);
  const setCurrentStep = useLexstudioStore((state) => state.setCurrentStep);

  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const totalSteps = UNIFIED_STEPS.length;
  const progress = ((completedSteps.length / totalSteps) * 100).toFixed(0);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow duration-200 px-5 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-body text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Unified Workflow
        </span>
        <span className="font-body text-xs font-medium text-[#324998]">
          {progress}%
        </span>
      </div>

      {/* Node Track */}
      <div className="flex items-center mb-4">
        {UNIFIED_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          // Steps 7-9 use a deeper navy shade
          const isContractZone = index >= 7;

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              {/* Node */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setCurrentStep(index)}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                  className={`
                    w-6 h-6 flex items-center justify-center rounded-full
                    transition-all duration-200 hover:scale-110
                    ${isCompleted
                      ? isContractZone
                        ? 'bg-[#1e2d5e] text-white shadow-sm'
                        : 'bg-[#324998] text-white shadow-sm'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                    }
                    ${isCurrent && !isCompleted
                      ? 'ring-2 ring-[#324998] ring-offset-2 ring-offset-white shadow-md animate-pulse'
                      : ''
                    }
                    ${isCurrent && isCompleted
                      ? 'ring-2 ring-[#324998] ring-offset-2 ring-offset-white shadow-md'
                      : ''
                    }
                  `}
                >
                  <span className="text-[8px] font-bold leading-none">
                    {isCompleted ? '✓' : index + 1}
                  </span>
                </button>

                {/* Tooltip */}
                {hoveredStep === index && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none">
                    {step}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < UNIFIED_STEPS.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-0.5 transition-colors duration-300
                    ${completedSteps.includes(index) ? 'bg-[#324998]' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Label */}
      <div className="text-center">
        <span className="font-body text-sm font-medium text-[#324998]">
          Step {currentStep + 1}/{totalSteps}: {UNIFIED_STEPS[currentStep]}
        </span>
      </div>
    </div>
  );
}

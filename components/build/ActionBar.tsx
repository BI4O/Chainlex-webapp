'use client';

import { useLexstudioStore } from '@/lib/store';

export function ActionBar() {
  const completedSteps = useLexstudioStore((state) => state.completedSteps);
  const phase = useLexstudioStore((state) => state.phase);
  const whitepaperContent = useLexstudioStore((state) => state.whitepaperContent);
  const contractContent = useLexstudioStore((state) => state.contractContent);

  const whitepaperComplete = completedSteps.length >= 12 && phase === 'whitepaper';
  const contractComplete = completedSteps.length >= 12 && phase === 'contract';

  const handleExport = () => {
    if (!whitepaperContent) return;
    // TODO: Implement export functionality
    console.log('Exporting whitepaper...');
  };

  const handleDeploy = () => {
    if (!contractContent) return;
    // TODO: Implement deploy functionality
    console.log('Deploying contract...');
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExport}
        disabled={!whitepaperComplete}
        className={`
          flex-1 h-11 px-4 font-body text-sm font-medium
          rounded-lg transition-all duration-200
          flex items-center justify-center gap-2
          ${whitepaperComplete
            ? 'bg-[#324998] text-white hover:bg-[#2a3d7f] active:scale-[0.98] shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {/* Export Icon */}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Export Whitepaper
      </button>

      <button
        onClick={handleDeploy}
        disabled={!contractComplete}
        className={`
          flex-1 h-11 px-4 font-body text-sm font-medium
          rounded-lg transition-all duration-200
          flex items-center justify-center gap-2
          ${contractComplete
            ? 'bg-[#324998] text-white hover:bg-[#2a3d7f] active:scale-[0.98] shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {/* Deploy Icon */}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Deploy Contract
      </button>
    </div>
  );
}

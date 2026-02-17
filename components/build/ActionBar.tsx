'use client';

import { useLexstudioStore } from '@/lib/store';

export function ActionBar() {
  const completedSteps = useLexstudioStore((state) => state.completedSteps);
  const phase = useLexstudioStore((state) => state.phase);
  const whitepaperContent = useLexstudioStore((state) => state.whitepaperContent);
  const contractContent = useLexstudioStore((state) => state.contractContent);

  const whitepaperComplete = completedSteps.length >= 7 && phase === 'whitepaper';
  const contractComplete = completedSteps.length >= 7 && phase === 'contract';

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
    <div className="flex gap-4">
      <button
        onClick={handleExport}
        disabled={!whitepaperComplete}
        className={`
          flex-1 px-6 py-3 font-body text-sm font-medium
          border-2 transition-all duration-200 rounded-lg
          ${whitepaperComplete
            ? 'bg-[#324998] text-white border-[#324998] hover:bg-black hover:border-black shadow-sm hover:shadow-md'
            : 'bg-white text-gray-400 border-[#E5E7EB] cursor-not-allowed'
          }
        `}
      >
        Export Whitepaper
      </button>

      <button
        onClick={handleDeploy}
        disabled={!contractComplete}
        className={`
          flex-1 px-6 py-3 font-body text-sm font-medium
          border-2 transition-all duration-200 rounded-lg
          ${contractComplete
            ? 'bg-[#324998] text-white border-[#324998] hover:bg-black hover:border-black shadow-sm hover:shadow-md'
            : 'bg-white text-gray-400 border-[#E5E7EB] cursor-not-allowed'
          }
        `}
      >
        Deploy Contract
      </button>
    </div>
  );
}

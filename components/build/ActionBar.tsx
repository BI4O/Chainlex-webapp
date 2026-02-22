'use client';

import { useLexstudioStore } from '@/lib/store';

export function ActionBar() {
  const completedSteps = useLexstudioStore((state) => state.completedSteps);
  const whitepaperContent = useLexstudioStore((state) => state.whitepaperContent);
  const contractContent = useLexstudioStore((state) => state.contractContent);

  // Both buttons unlock when step 9 (Final Review) is completed
  const workflowComplete = completedSteps.includes(9);

  const handleExport = () => {
    if (!whitepaperContent) return;
    // Export whitepaper as markdown file
    const blob = new Blob([whitepaperContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whitepaper.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeploy = () => {
    if (!contractContent) return;
    // Export contract as Solidity file
    const blob = new Blob([contractContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Token.sol';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExport}
        disabled={!workflowComplete}
        className={`
          flex-1 h-11 px-4 font-body text-sm font-medium
          rounded-lg transition-all duration-200
          flex items-center justify-center gap-2
          ${workflowComplete
            ? 'bg-[#324998] text-white hover:bg-[#2a3d7f] active:scale-[0.98] shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        disabled={!workflowComplete}
        className={`
          flex-1 h-11 px-4 font-body text-sm font-medium
          rounded-lg transition-all duration-200
          flex items-center justify-center gap-2
          ${workflowComplete
            ? 'bg-[#324998] text-white hover:bg-[#2a3d7f] active:scale-[0.98] shadow-sm hover:shadow-md'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

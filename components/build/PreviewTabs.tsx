'use client';

import { useLexstudioStore } from '@/lib/store';
import { PreviewTab } from '@/lib/types';

export function PreviewTabs() {
  const previewTab = useLexstudioStore((state) => state.previewTab);
  const setPreviewTab = useLexstudioStore((state) => state.setPreviewTab);

  const tabs: { id: PreviewTab; label: string }[] = [
    { id: 'whitepaper', label: 'Whitepaper' },
    { id: 'contract', label: 'Contract' },
    { id: 'arch-map', label: 'Arch-Map' },
  ];

  return (
    <div className="flex border-b border-[#E0E0E0] mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setPreviewTab(tab.id)}
          className={`
            px-6 py-3 font-body text-sm font-medium
            transition-all duration-200
            ${previewTab === tab.id
              ? 'border-b-2 border-[#324998] text-[#324998] -mb-px'
              : 'text-gray-500 hover:text-[#324998]'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

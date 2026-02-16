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
    <div className="flex border-b-2 border-foreground mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setPreviewTab(tab.id)}
          className={`
            px-6 py-3 font-mono text-xs uppercase tracking-widest
            transition-all duration-100
            ${previewTab === tab.id
              ? 'border-b-2 border-foreground -mb-0.5'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

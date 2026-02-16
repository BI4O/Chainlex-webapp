'use client';

import { useState } from 'react';

type TabType = 'whitepaper' | 'contract' | 'arch-map';

export function PreviewTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('whitepaper');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'whitepaper', label: 'Whitepaper' },
    { id: 'contract', label: 'Contract' },
    { id: 'arch-map', label: 'Arch-Map' },
  ];

  return (
    <div className="flex border-b-2 border-foreground mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            px-6 py-3 font-mono text-xs uppercase tracking-widest
            transition-all duration-100
            ${activeTab === tab.id
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

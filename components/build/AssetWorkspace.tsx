'use client';

import { useLexstudioStore } from '@/lib/store';
import { MilestoneTracker } from './MilestoneTracker';
import { PreviewTabs } from './PreviewTabs';
import { PreviewArea } from './PreviewArea';
import { ActionBar } from './ActionBar';

export function AssetWorkspace() {
  const assetData = useLexstudioStore((state) => state.assetData);

  return (
    <div className="flex flex-col h-full p-8 lg:p-12">
      {/* Header */}
      <div className="mb-12 lg:mb-16">
        <h1 className="font-body font-bold text-4xl tracking-tight mb-2">
          {assetData.name || 'New Asset'}
        </h1>
        <p className="font-body text-lg text-[#324998]">
          {assetData.type || 'Asset description will appear here'}
        </p>
      </div>

      {/* Milestone Tracker */}
      <div className="mb-12 lg:mb-16">
        <MilestoneTracker />
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <PreviewTabs />
        <PreviewArea />
      </div>

      {/* Action Bar */}
      <div className="mt-8">
        <ActionBar />
      </div>
    </div>
  );
}

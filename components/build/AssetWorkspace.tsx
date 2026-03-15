'use client';

import { useLexstudioStore } from '@/lib/store';
import { ProgressCard } from './ProgressCard';
import { MetadataCard } from './MetadataCard';
import { PreviewCard } from './PreviewCard';
import { ActionBar } from './ActionBar';

export function AssetWorkspace() {
  const assetData = useLexstudioStore((state) => state.assetData);
  const updateAssetData = useLexstudioStore((state) => state.updateAssetData);

  return (
    <div className="flex flex-col h-full bg-[var(--background-canvas)] overflow-hidden">
      {/* 1. Progress Card */}
      <div className="px-4 pt-4 pb-2">
        <ProgressCard />
      </div>

      {/* 2. Metadata Card */}
      <div className="px-4 pb-2">
        <MetadataCard assetData={assetData} onUpdateAssetData={updateAssetData} />
      </div>

      {/* 3. Preview Content Card */}
      <div className="flex-1 px-4 pb-4 min-h-0">
        <PreviewCard />
      </div>

      {/* 4. Action Bar */}
      <div className="px-4 pb-4 pt-1 bg-gradient-to-t from-[var(--background-canvas)] via-[var(--background-canvas)] to-transparent">
        <ActionBar />
      </div>
    </div>
  );
}

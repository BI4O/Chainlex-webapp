'use client';

import { useLexstudioStore } from '@/lib/store';
import { ProgressCard } from './ProgressCard';
import { MetadataCard } from './MetadataCard';
import { PreviewCard } from './PreviewCard';
import { ActionBar } from './ActionBar';

export function AssetWorkspace() {
  const assetData = useLexstudioStore((state) => state.assetData);

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] overflow-hidden">
      {/* 1. Progress Card */}
      <div className="px-6 pt-6 pb-4">
        <ProgressCard />
      </div>

      {/* 2. Metadata Card */}
      <div className="px-6 pb-4">
        <MetadataCard assetData={assetData} />
      </div>

      {/* 3. Preview Content Card */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <PreviewCard />
      </div>

      {/* 4. Action Bar */}
      <div className="px-6 pb-6 pt-2 bg-gradient-to-t from-[#f0f2f5] via-[#f0f2f5] to-transparent">
        <ActionBar />
      </div>
    </div>
  );
}

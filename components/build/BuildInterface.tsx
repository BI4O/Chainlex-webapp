'use client';

import { AIConsole } from './AIConsole';
import { AssetWorkspace } from './AssetWorkspace';

export function BuildInterface() {
  return (
    <div className="flex h-screen animate-fade-in">
      {/* AI Console - 42% */}
      <div className="w-[42%] border-r border-[#E5E7EB]">
        <AIConsole />
      </div>

      {/* Asset Workspace - 58% with delayed slide-in */}
      <div className="w-[58%] overflow-hidden">
        <div className="animate-slide-in-right-delayed h-full">
          <AssetWorkspace />
        </div>
      </div>
    </div>
  );
}

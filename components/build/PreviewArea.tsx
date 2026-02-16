'use client';

import { useLexstudioStore } from '@/lib/store';

export function PreviewArea() {
  const whitepaperContent = useLexstudioStore((state) => state.whitepaperContent);
  const contractContent = useLexstudioStore((state) => state.contractContent);

  return (
    <div className="flex-1 border-2 border-foreground p-6 overflow-y-auto bg-background">
      {whitepaperContent || contractContent ? (
        <div className="font-body text-base whitespace-pre-wrap">
          {whitepaperContent || contractContent}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p className="font-body text-center">
            Content will appear here as you progress through the steps
          </p>
        </div>
      )}
    </div>
  );
}

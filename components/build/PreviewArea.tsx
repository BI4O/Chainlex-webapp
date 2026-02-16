'use client';

import { useLexstudioStore } from '@/lib/store';

export function PreviewArea() {
  const previewTab = useLexstudioStore((state) => state.previewTab);
  const whitepaperContent = useLexstudioStore((state) => state.whitepaperContent);
  const contractContent = useLexstudioStore((state) => state.contractContent);

  // Determine content based on active tab
  let content = '';
  let placeholder = '';

  switch (previewTab) {
    case 'whitepaper':
      content = whitepaperContent;
      placeholder = 'Whitepaper content will appear here as you progress through the steps';
      break;
    case 'contract':
      content = contractContent;
      placeholder = 'Contract content will appear here after whitepaper is complete';
      break;
    case 'arch-map':
      content = '';
      placeholder = 'Architecture map will be generated based on your asset structure';
      break;
  }

  return (
    <div className="flex-1 border-2 border-foreground p-6 overflow-y-auto bg-background">
      {content ? (
        <div className="font-body text-base whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p className="font-body text-center">
            {placeholder}
          </p>
        </div>
      )}
    </div>
  );
}

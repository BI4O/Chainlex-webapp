'use client';

import { useLexstudioStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';

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
        <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-h1:text-2xl prose-h1:border-b-2 prose-h1:border-foreground prose-h1:pb-2 prose-h2:text-xl prose-h2:mt-6 prose-h3:text-lg prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:font-bold prose-hr:border-foreground prose-hr:my-4">
          <ReactMarkdown>{content}</ReactMarkdown>
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

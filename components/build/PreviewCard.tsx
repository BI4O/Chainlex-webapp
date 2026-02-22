'use client';

import { useLexstudioStore } from '@/lib/store';
import { PreviewTab } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

export function PreviewCard() {
  const previewTab = useLexstudioStore((state) => state.previewTab);
  const setPreviewTab = useLexstudioStore((state) => state.setPreviewTab);
  const whitepaperContent = useLexstudioStore((state) => state.whitepaperContent);
  const contractContent = useLexstudioStore((state) => state.contractContent);

  const tabs: { id: PreviewTab; label: string }[] = [
    { id: 'whitepaper', label: 'Whitepaper' },
    { id: 'contract', label: 'Contract' },
    { id: 'arch-map', label: 'Arch-Map' },
  ];

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
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPreviewTab(tab.id)}
            className={`
              relative px-5 py-3 font-body text-sm font-medium
              transition-all duration-150
              ${previewTab === tab.id
                ? 'text-[#324998]'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
            {/* Bottom Indicator */}
            {previewTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#324998]" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {content ? (
          <div className="prose prose-sm max-w-none prose-headings:font-body prose-headings:font-bold prose-headings:text-black prose-h1:text-2xl prose-h1:border-b prose-h1:border-[#E5E7EB] prose-h1:pb-2 prose-h2:text-xl prose-h2:mt-6 prose-h2:text-[#324998] prose-h3:text-lg prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:font-bold prose-hr:border-[#E5E7EB] prose-hr:my-4">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            {/* Empty State Icon */}
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-body text-center text-sm max-w-xs">
              {placeholder}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

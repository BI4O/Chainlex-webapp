'use client';

import { Message as MessageType } from '@/lib/types';
import { LoadingDots } from './LoadingDots';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.content === '...';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] px-4 py-3 font-body text-sm rounded-lg
          transition-all duration-200
          ${isUser
            ? 'bg-[#324998] text-white shadow-sm hover:shadow-md'
            : 'bg-white text-black shadow-sm hover:shadow-md border border-[#E5E7EB]'
          }
        `}
      >
        {isLoading ? (
          <LoadingDots />
        ) : isUser ? (
          message.content
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:font-body prose-headings:font-bold prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:font-bold">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
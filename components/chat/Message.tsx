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
          max-w-[85%] px-6 py-4 font-body text-base rounded-xl
          transition-all duration-200
          ${isUser
            ? 'bg-[#324998] text-white shadow-md hover:shadow-lg'
            : 'bg-white text-black shadow-md hover:shadow-lg border border-[#E5E7EB]'
          }
        `}
      >
        {isLoading ? (
          <LoadingDots />
        ) : isUser ? (
          message.content
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:font-body prose-headings:font-bold prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:font-bold">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
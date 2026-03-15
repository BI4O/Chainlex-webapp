'use client';

import { Message as MessageType } from '@/lib/types';
import { LoadingDots } from './LoadingDots';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: MessageType;
}

// Detect message content type to apply appropriate accent color
function getMessageAccent(content: string): { border: string; bg: string } {
  const lower = content.toLowerCase();

  // Error or warning messages
  if (content.startsWith('⚠️') || lower.includes('error') || lower.includes('failed')) {
    return { border: 'border-l-red-500', bg: 'bg-red-50/30' };
  }
  // Success or completion
  if (lower.includes('success') || lower.includes('complete') || lower.includes('confirmed') || lower.includes('✓')) {
    return { border: 'border-l-green-500', bg: 'bg-green-50/30' };
  }
  // Code or technical content
  if (content.includes('```') || content.includes('function ') || content.includes('contract ')) {
    return { border: 'border-l-purple-500', bg: 'bg-purple-50/30' };
  }
  // Steps or instructions
  if (lower.includes('step') || lower.includes('next') || lower.includes('proceed')) {
    return { border: 'border-l-blue-500', bg: 'bg-blue-50/30' };
  }
  // Default - subtle accent
  return { border: 'border-l-[var(--accent)]/50', bg: 'bg-white' };
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.content === '...';
  const accent = !isUser && !isLoading ? getMessageAccent(message.content) : null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] px-4 py-3 font-body text-sm rounded-lg
          transition-all duration-200
          ${isUser
            ? 'bg-[var(--accent)] text-white shadow-sm hover:shadow-md'
            : accent
              ? `${accent.bg} text-black shadow-sm hover:shadow-md border border-[#E5E7EB] border-l-[3px] ${accent.border}`
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
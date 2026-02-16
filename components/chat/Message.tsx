'use client';

import { Message as MessageType } from '@/lib/types';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] px-6 py-4 font-body text-base
          ${isUser
            ? 'bg-foreground text-background'
            : 'bg-background text-foreground border-2 border-foreground'
          }
        `}
      >
        {message.content}
      </div>
    </div>
  );
}
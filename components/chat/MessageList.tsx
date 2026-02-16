'use client';

import { useLexstudioStore } from '@/lib/store';
import { Message } from './Message';

export function MessageList() {
  const messages = useLexstudioStore((state) => state.messages);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-body text-muted-foreground text-lg">
          Start a conversation...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
}
'use client';

import { useEffect, useRef } from 'react';
import { useLexstudioStore } from '@/lib/store';
import { Message } from './Message';

export function MessageList() {
  const messages = useLexstudioStore((state) => state.messages);
  const mode = useLexstudioStore((state) => state.mode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or content updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Also scroll on window resize (in case input box changes)
  useEffect(() => {
    const handleResize = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-body text-muted-foreground text-lg">
          Start a conversation...
        </p>
      </div>
    );
  }

  // Add bottom padding to account for InputBox height
  // InputBox is approximately 180px in chat mode, 200px in build mode
  const bottomPadding = mode === 'build' ? 'pb-56' : 'pb-48';

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-8 py-8 space-y-6 ${bottomPadding}`}
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
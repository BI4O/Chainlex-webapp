'use client';

import { useEffect, useRef, useState } from 'react';
import { useLexstudioStore } from '@/lib/store';
import { Message } from './Message';

export function MessageList() {
  const messages = useLexstudioStore((state) => state.messages);
  const mode = useLexstudioStore((state) => state.mode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle scroll detection for elegant scrollbar fade
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Hide scrollbar after 1.5s of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="font-body text-gray-500 text-base">
          Start a conversation...
        </p>
      </div>
    );
  }

  // Add bottom padding to account for InputBox height (reduced from 48/56)
  const bottomPadding = mode === 'build' ? 'pb-44' : 'pb-36';

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto scrollbar-thin ${bottomPadding} ${isScrolling ? 'scrolling' : ''}`}
    >
      {/* ChatGPT-style centered container with max-width */}
      <div className="max-w-5xl mx-auto px-6 py-5 space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
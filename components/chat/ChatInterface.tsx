'use client';

import { MessageList } from './MessageList';
import { InputBox } from './InputBox';

export function ChatInterface() {
  return (
    <div className="flex flex-col h-screen animate-fade-in">
      <MessageList />
      <InputBox />
    </div>
  );
}
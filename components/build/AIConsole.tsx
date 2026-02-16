'use client';

import { MessageList } from '../chat/MessageList';
import { InputBox } from '../chat/InputBox';

export function AIConsole() {
  return (
    <div className="relative flex flex-col h-full">
      <MessageList />
      <InputBox />
    </div>
  );
}

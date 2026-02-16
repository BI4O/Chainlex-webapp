'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { BuildInterface } from '@/components/build/BuildInterface';
import { useLexstudioStore } from '@/lib/store';

export default function Home() {
  const mode = useLexstudioStore((state) => state.mode);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        {mode === 'chat' ? <ChatInterface /> : <BuildInterface />}
      </main>
    </div>
  );
}

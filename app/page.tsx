import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1">
        <ChatInterface />
      </main>
    </div>
  );
}

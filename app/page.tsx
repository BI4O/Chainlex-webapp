import { Sidebar } from '@/components/layout/Sidebar';

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="font-display text-4xl">Welcome to Lexstudio</h1>
      </main>
    </div>
  );
}

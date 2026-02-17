'use client';
import { SidebarNav } from './SidebarNav';
import { SidebarHistory } from './SidebarHistory';
import { SidebarUser } from './SidebarUser';
import { useLexstudioStore } from '@/lib/store';

export function Sidebar() {
  const sidebarCollapsed = useLexstudioStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useLexstudioStore((state) => state.setSidebarCollapsed);

  if (sidebarCollapsed) {
    return (
      <div className="w-8 h-screen flex flex-col items-center justify-start pt-4 bg-foreground border-r-2 border-foreground/20">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="w-6 h-12 flex items-center justify-center bg-background text-foreground font-mono text-sm hover:bg-muted transition-colors"
          title="展开侧边栏"
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <aside className="w-60 h-screen flex flex-col bg-background border-r-2 border-foreground">
      {/* Header */}
      <div className="p-4 border-b-2 border-foreground flex items-center justify-between">
        <h1 className="font-display text-xl tracking-tight">LEXSTUDIO</h1>
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="font-mono text-sm hover:opacity-50"
        >
          ◀
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <SidebarNav />
      </div>

      {/* Divider */}
      <div className="h-1 bg-foreground" />

      {/* History */}
      <SidebarHistory />

      {/* Divider */}
      <div className="h-1 bg-foreground" />

      {/* User */}
      <SidebarUser />
    </aside>
  );
}

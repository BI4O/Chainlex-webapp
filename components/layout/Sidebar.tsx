'use client';
import { useState } from 'react';
import { SidebarNav } from './SidebarNav';
import { SidebarHistory } from './SidebarHistory';
import { SidebarUser } from './SidebarUser';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-0 overflow-hidden">
        {/* Collapsed state - could add a toggle button here */}
      </div>
    );
  }

  return (
    <aside className="w-60 h-screen flex flex-col bg-background border-r-2 border-foreground">
      {/* Header */}
      <div className="p-4 border-b-2 border-foreground flex items-center justify-between">
        <h1 className="font-display text-xl tracking-tight">LEXSTUDIO</h1>
        <button
          onClick={() => setIsCollapsed(true)}
          className="font-mono text-sm hover:opacity-50"
        >
          ≡
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

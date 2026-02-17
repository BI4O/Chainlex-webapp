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
      <div className="w-8 h-screen flex flex-col items-center justify-start pt-4 bg-white border-r border-[#E5E7EB]">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="w-6 h-12 flex items-center justify-center bg-[#f0f2f5] text-black font-mono text-sm hover:bg-[#E5E7EB] transition-all duration-200 rounded-lg"
          title="展开侧边栏"
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <aside className="w-60 h-screen flex flex-col bg-white border-r border-[#E5E7EB] shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <h1 className="font-body font-bold text-xl tracking-tight">Chainlex.ai</h1>
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="font-mono text-sm hover:opacity-50 transition-opacity duration-200"
        >
          ◀
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <SidebarNav />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E5E7EB]" />

      {/* History */}
      <SidebarHistory />

      {/* Divider */}
      <div className="h-px bg-[#E5E7EB]" />

      {/* User */}
      <SidebarUser />
    </aside>
  );
}

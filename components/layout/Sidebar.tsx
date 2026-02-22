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
      <div className="w-6 h-screen flex flex-col items-center justify-start pt-3 bg-white border-r border-[#E5E7EB]">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="w-5 h-10 flex items-center justify-center bg-[#f0f2f5] text-black font-mono text-xs hover:bg-[#E5E7EB] transition-all duration-200 rounded-md"
          title="展开侧边栏"
        >
          ▶
        </button>
      </div>
    );
  }

  return (
    <aside className="w-48 h-screen flex flex-col bg-white border-r border-[#E5E7EB] shadow-sm">
      {/* Header */}
      <div className="px-3 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <h1 className="font-body font-bold text-base tracking-tight">Chainlex.ai</h1>
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="font-mono text-xs hover:opacity-50 transition-opacity duration-200"
        >
          ◀
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 py-2">
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

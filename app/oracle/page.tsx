'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { OracleDashboard } from '@/components/dashboard/oracle-dashboard';

export default function OraclePage() {
  return (
    <div className="flex h-screen bg-[var(--background-canvas)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <OracleDashboard />
      </main>
    </div>
  );
}

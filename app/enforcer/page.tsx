'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { EnforcerDashboard } from '@/components/enforcer/enforcer-dashboard';

export default function EnforcerPage() {
  return (
    <div className="flex h-screen bg-[var(--background-canvas)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <EnforcerDashboard />
      </main>
    </div>
  );
}

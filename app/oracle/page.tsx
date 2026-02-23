'use client';

import { Sidebar } from '@/components/layout/Sidebar';

export default function OraclePage() {
  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-body text-4xl font-bold text-[#324998] mb-4">
            Welcome to Oracle
          </h1>
          <p className="font-body text-gray-500 text-lg">
            Coming soon
          </p>
        </div>
      </main>
    </div>
  );
}

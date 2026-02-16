'use client';

interface HistoryItem {
  id: string;
  title: string;
  type: 'chat' | 'build';
}

export function SidebarHistory() {
  const historyItems: HistoryItem[] = [
    { id: '1', title: 'Real Estate Fund', type: 'build' },
    { id: '2', title: 'Tech Startup Token', type: 'build' },
    { id: '3', title: 'Chat: RWA basics', type: 'chat' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <h3 className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        History
      </h3>
      <div className="space-y-1">
        {historyItems.map((item) => (
          <button
            key={item.id}
            className="
              w-full px-4 py-2 text-left font-body text-sm
              hover:border-b-2 hover:border-foreground
              transition-all duration-100
            "
          >
            ▸ {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}

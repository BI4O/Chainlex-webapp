'use client';

import { useLexstudioStore } from '@/lib/store';

export function SidebarHistory() {
  const sessions = useLexstudioStore((state) => state.sessions);
  const currentSessionId = useLexstudioStore((state) => state.currentSessionId);
  const switchSession = useLexstudioStore((state) => state.switchSession);
  const createSession = useLexstudioStore((state) => state.createSession);
  const deleteSession = useLexstudioStore((state) => state.deleteSession);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* New Chat Button */}
      <div className="px-4 py-3 border-b-2 border-foreground">
        <button
          onClick={createSession}
          className="w-full px-4 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-background hover:text-foreground border-2 border-foreground transition-all duration-100"
        >
          + New Chat
        </button>
      </div>

      {/* History Header */}
      <h3 className="px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        History
      </h3>

      {/* Session List */}
      <div className="space-y-1 px-2">
        {sessions.length === 0 ? (
          <p className="px-4 py-2 font-body text-sm text-muted-foreground">
            No sessions yet
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`
                group relative flex items-center justify-between
                px-4 py-2 font-body text-sm
                transition-all duration-100
                ${currentSessionId === session.id
                  ? 'bg-foreground text-background'
                  : 'hover:border-b-2 hover:border-foreground cursor-pointer'
                }
              `}
            >
              <button
                onClick={() => switchSession(session.id)}
                className="flex-1 text-left truncate"
              >
                ▸ {session.title}
              </button>

              {/* Delete button - only show on hover */}
              {currentSessionId !== session.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 ml-2 px-2 hover:text-red-600 transition-opacity duration-100"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

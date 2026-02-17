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
      <div className="px-4 py-3 border-b border-[#E5E7EB]">
        <button
          onClick={createSession}
          className="w-full px-4 py-2 bg-[#324998] text-white font-body text-sm font-medium hover:bg-black border border-[#324998] hover:border-black transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
        >
          + New Chat
        </button>
      </div>

      {/* History Header */}
      <h3 className="px-4 py-2 font-body text-xs font-medium uppercase tracking-wide text-gray-500">
        History
      </h3>

      {/* Session List */}
      <div className="space-y-1 px-2">
        {sessions.length === 0 ? (
          <p className="px-4 py-2 font-body text-sm text-gray-500">
            No sessions yet
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`
                group relative flex items-center justify-between
                px-4 py-2 font-body text-sm rounded-lg
                transition-all duration-200
                ${currentSessionId === session.id
                  ? 'bg-[#324998] text-white shadow-sm'
                  : 'hover:bg-[#f0f2f5] cursor-pointer'
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
                  className="opacity-0 group-hover:opacity-100 ml-2 px-2 hover:text-red-600 transition-opacity duration-200"
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

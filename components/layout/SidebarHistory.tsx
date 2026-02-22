'use client';

import { useEffect, useRef, useState } from 'react';
import { useLexstudioStore } from '@/lib/store';

export function SidebarHistory() {
  const sessions = useLexstudioStore((state) => state.sessions);
  const currentSessionId = useLexstudioStore((state) => state.currentSessionId);
  const switchSession = useLexstudioStore((state) => state.switchSession);
  const createSession = useLexstudioStore((state) => state.createSession);
  const deleteSession = useLexstudioStore((state) => state.deleteSession);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll detection for elegant scrollbar fade
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto flex flex-col scrollbar-thin ${isScrolling ? 'scrolling' : ''}`}
    >
      {/* New Chat Button */}
      <div className="px-3 py-2 border-b border-[#E5E7EB]">
        <button
          onClick={createSession}
          className="w-full px-3 py-1.5 bg-[#324998] text-white font-body text-xs font-medium hover:bg-black border border-[#324998] hover:border-black transition-all duration-200 rounded-md shadow-sm hover:shadow-md"
        >
          + New Chat
        </button>
      </div>

      {/* History Header */}
      <h3 className="px-3 py-1.5 font-body text-[10px] font-medium uppercase tracking-wide text-gray-500">
        History
      </h3>

      {/* Session List */}
      <div className="space-y-0.5 px-1.5">
        {sessions.length === 0 ? (
          <p className="px-3 py-1.5 font-body text-xs text-gray-500">
            No sessions yet
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`
                group relative flex items-center justify-between
                px-3 py-1.5 font-body text-xs rounded-md
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
                  className="opacity-0 group-hover:opacity-100 ml-1.5 px-1.5 hover:text-red-600 transition-opacity duration-200"
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

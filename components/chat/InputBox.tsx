'use client';

import { useState } from 'react';
import { useLexstudioStore } from '@/lib/store';
import { sendChatMessage } from '@/lib/api';

export function InputBox() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const mode = useLexstudioStore((state) => state.mode);
  const setMode = useLexstudioStore((state) => state.setMode);
  const messages = useLexstudioStore((state) => state.messages);
  const addMessage = useLexstudioStore((state) => state.addMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    addMessage({
      role: 'user',
      content: userInput,
    });

    try {
      // Send to backend
      const response = await sendChatMessage({
        user_input: userInput,
        history: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Add AI response
      addMessage({
        role: 'assistant',
        content: response.message,
      });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const isBuildMode = mode === 'build';

  return (
    <div className="fixed bottom-8 left-[280px] right-16 mx-8">
      <div className={`
        border-2 transition-all duration-300 ease-in-out
        ${isBuildMode
          ? 'bg-foreground border-background'
          : 'bg-background border-foreground'
        }
      `}>
        {/* Mode Toggle - Redesigned */}
        <div className={`
          flex items-center justify-between px-6 py-3 border-b-2 transition-colors duration-300
          ${isBuildMode ? 'border-background' : 'border-foreground'}
        `}>
          <span className={`
            font-mono text-xs uppercase tracking-widest transition-colors duration-300
            ${isBuildMode ? 'text-muted' : 'text-muted-foreground'}
          `}>
            Mode
          </span>

          {/* Toggle Switch */}
          <button
            onClick={() => setMode(mode === 'chat' ? 'build' : 'chat')}
            className="relative flex items-center gap-0 font-mono text-xs uppercase tracking-widest overflow-hidden"
          >
            <div className={`
              relative w-32 h-8 border-2 transition-all duration-300
              ${isBuildMode ? 'border-background' : 'border-foreground'}
            `}>
              {/* Sliding background */}
              <div
                className={`
                  absolute top-0 h-full w-1/2 transition-all duration-300 ease-out
                  ${isBuildMode
                    ? 'left-1/2 bg-background'
                    : 'left-0 bg-foreground'
                  }
                `}
                style={{
                  transform: isBuildMode ? 'translateX(0)' : 'translateX(0)',
                }}
              />

              {/* Text labels */}
              <div className="relative flex h-full">
                <div className={`
                  flex-1 flex items-center justify-center transition-all duration-300
                  ${!isBuildMode ? 'text-background font-bold' : 'text-foreground'}
                `}>
                  CHAT
                </div>
                <div className={`
                  flex-1 flex items-center justify-center transition-all duration-300
                  ${isBuildMode ? 'text-foreground font-bold' : 'text-background'}
                `}>
                  BUILD
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-4 p-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isBuildMode ? "Build your asset..." : "Type your message..."}
            disabled={loading}
            className={`
              flex-1 bg-transparent font-body text-base outline-none disabled:opacity-50
              transition-colors duration-300
              ${isBuildMode
                ? 'text-background placeholder:text-muted'
                : 'text-foreground placeholder:text-muted-foreground'
              }
            `}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`
              w-10 h-10 flex items-center justify-center font-mono text-xl
              border-2 transition-all duration-200
              ${loading || !input.trim()
                ? 'opacity-25 cursor-not-allowed'
                : isBuildMode
                  ? 'bg-background text-foreground border-background hover:bg-foreground hover:text-background hover:scale-110'
                  : 'bg-foreground text-background border-foreground hover:bg-background hover:text-foreground hover:scale-110'
              }
            `}
          >
            {loading ? '...' : '↑'}
          </button>
        </form>
      </div>
    </div>
  );
}

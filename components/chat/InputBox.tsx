'use client';

import { useState, useRef } from 'react';
import { useLexstudioStore } from '@/lib/store';

export function InputBox() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const streamingContentRef = useRef('');

  const mode = useLexstudioStore((state) => state.mode);
  const setMode = useLexstudioStore((state) => state.setMode);
  const messages = useLexstudioStore((state) => state.messages);
  const addMessage = useLexstudioStore((state) => state.addMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || streaming) return;

    const userInput = input.trim();
    setInput('');
    setLoading(true);
    streamingContentRef.current = '';

    // Add user message
    addMessage({
      role: 'user',
      content: userInput,
    });

    // Add placeholder for AI message with loading dots
    const placeholderId = `placeholder-${Date.now()}`;
    addMessage({
      role: 'assistant',
      content: '...',
    });

    try {
      setLoading(false);
      setStreaming(true);

      // Use EventSource for Server-Sent Events
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_input: userInput,
          history: messages.slice(0, -1).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                streamingContentRef.current += parsed.token;
                // Update the last message with accumulated content
                const currentMessages = useLexstudioStore.getState().messages;
                const lastMessage = currentMessages[currentMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  // Force update by creating new array
                  useLexstudioStore.setState({
                    messages: [
                      ...currentMessages.slice(0, -1),
                      { ...lastMessage, content: streamingContentRef.current }
                    ]
                  });
                }
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      // Update last message with error
      const currentMessages = useLexstudioStore.getState().messages;
      useLexstudioStore.setState({
        messages: [
          ...currentMessages.slice(0, -1),
          {
            ...currentMessages[currentMessages.length - 1],
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      });
    } finally {
      setStreaming(false);
      streamingContentRef.current = '';
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

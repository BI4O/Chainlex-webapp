'use client';

import { useState } from 'react';
import { sendChatMessage } from '@/lib/api';

export default function TestPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await sendChatMessage({
        user_input: input,
        history: [],
      });
      setResponse(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="font-display text-4xl mb-8">API Test</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a message..."
            className="w-full px-4 py-2 border border-black"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 border border-black bg-red-50">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {response && (
        <div className="mt-4 p-4 border border-black">
          <h2 className="font-display text-xl mb-2">Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

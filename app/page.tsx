'use client';
import { useLexstudioStore } from '@/lib/store';

export default function Home() {
  const { mode, setMode } = useLexstudioStore();
  return (
    <div className="p-8">
      <p>Current mode: {mode}</p>
      <button onClick={() => setMode('build')}>Switch to Build</button>
    </div>
  );
}

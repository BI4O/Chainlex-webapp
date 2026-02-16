'use client';

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }}>.</span>
    </div>
  );
}

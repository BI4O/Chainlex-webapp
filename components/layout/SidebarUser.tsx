'use client';

export function SidebarUser() {
  return (
    <div className="border-t-2 border-foreground p-4">
      <div className="flex items-center justify-between">
        <span className="font-body text-sm">@Founder</span>
        <button className="font-body text-sm hover:underline">
          ⚙
        </button>
      </div>
    </div>
  );
}

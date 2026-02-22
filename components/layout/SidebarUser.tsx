'use client';

export function SidebarUser() {
  return (
    <div className="border-t border-[#E5E7EB] px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs">@Founder</span>
        <button className="font-body text-xs hover:opacity-70 transition-opacity duration-200">
          ⚙
        </button>
      </div>
    </div>
  );
}

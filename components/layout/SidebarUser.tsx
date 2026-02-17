'use client';

export function SidebarUser() {
  return (
    <div className="border-t border-[#E5E7EB] p-4">
      <div className="flex items-center justify-between">
        <span className="font-body text-sm">@Founder</span>
        <button className="font-body text-sm hover:opacity-70 transition-opacity duration-200">
          ⚙
        </button>
      </div>
    </div>
  );
}

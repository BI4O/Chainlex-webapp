'use client';

interface NavItem {
  id: string;
  label: string;
  active: boolean;
}

export function SidebarNav() {
  const navItems: NavItem[] = [
    { id: 'studio', label: 'Studio', active: true },
    { id: 'oracle', label: 'Oracle', active: false },
    { id: 'enforcer', label: 'Enforcer', active: false },
  ];

  return (
    <nav className="space-y-1.5">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`
            w-full px-3 py-2 text-left font-body text-xs rounded-md
            transition-all duration-200
            ${item.active
              ? 'bg-[#324998] text-white shadow-sm'
              : 'bg-white text-black border border-[#E5E7EB] hover:bg-[#324998] hover:text-white hover:shadow-sm'
            }
          `}
        >
          {item.active && '● '}{item.label}
        </button>
      ))}
    </nav>
  );
}

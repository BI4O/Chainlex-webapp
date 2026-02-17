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
    <nav className="space-y-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`
            w-full px-4 py-3 text-left font-body text-sm rounded-lg
            transition-all duration-200
            ${item.active
              ? 'bg-[#324998] text-white shadow-md'
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

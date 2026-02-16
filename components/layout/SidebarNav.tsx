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
            w-full px-4 py-3 text-left font-body text-sm
            transition-colors duration-100
            ${item.active
              ? 'bg-foreground text-background'
              : 'bg-background text-foreground border-2 border-foreground hover:bg-foreground hover:text-background'
            }
          `}
        >
          {item.active && '● '}{item.label}
        </button>
      ))}
    </nav>
  );
}

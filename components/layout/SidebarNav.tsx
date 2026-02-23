'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

export function SidebarNav() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { id: 'studio', label: 'Studio', href: '/' },
    { id: 'oracle', label: 'Oracle', href: '/oracle' },
    { id: 'enforcer', label: 'Enforcer', href: '/enforcer' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="space-y-1.5">
      {navItems.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`
            block w-full px-3 py-2 text-left font-body text-xs rounded-md
            transition-all duration-200
            ${isActive(item.href)
              ? 'bg-[#324998] text-white shadow-sm'
              : 'bg-white text-black border border-[#E5E7EB] hover:bg-[#324998] hover:text-white hover:shadow-sm'
            }
          `}
        >
          {isActive(item.href) && '● '}{item.label}
        </Link>
      ))}
    </nav>
  );
}

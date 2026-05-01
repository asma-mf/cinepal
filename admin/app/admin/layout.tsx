// Admin layout: sidebar navigation
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

const navLinks = [
  { href: '/admin/movies', label: 'Movies' },
  { href: '/admin/theatres', label: 'Theatres' },
  { href: '/admin/showtimes', label: 'Showtimes' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <span className="text-red-500 font-bold text-xl">CinePal</span>
          <span className="text-gray-400 text-sm ml-2">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <UserButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

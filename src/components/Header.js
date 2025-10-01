"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sales-form", label: "Sales Form" },
];

function NavLink({ href, label, isActive }) {
  return (
    <Link
      href={href}
      className={`py-1 text-sm transition-colors ${
        isActive
          ? "text-black border-b border-black"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <h1 className="text-lg font-medium text-black">Sales Offer</h1>
          <nav className="flex space-x-6">
            {navItems.map(({ href, label }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                isActive={pathname === href}
              />
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

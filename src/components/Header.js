"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../app/(auth)/login/actions";

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

  const onClickLogout = async () => {
    console.log("logout");
    const res = await logout();
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <h1 className="text-lg font-medium text-black">Sales Offer</h1>
          <div className="flex items-center space-x-6">
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
            <button
              onClick={onClickLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

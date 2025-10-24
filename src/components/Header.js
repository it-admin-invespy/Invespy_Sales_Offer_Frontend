"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "../app/(auth)/login/actions";
import DynamicButton from "./DynamicButton";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track your sales offers
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DynamicButton
              onClick={() => router.push("/sales-form")}
              variant="primary"
              className="px-6 py-3 text-sm font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Form
            </DynamicButton>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

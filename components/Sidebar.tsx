"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />
    ),
  },
  {
    href: "/notebook",
    label: "Notebook",
    icon: (
      <path d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 5v4m-2-2h4" />
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="glass sticky top-0 z-30 flex h-auto w-full flex-row items-center gap-2 border-b border-vault-border px-4 py-3 md:h-screen md:w-64 md:flex-col md:items-stretch md:gap-1 md:border-b-0 md:border-r md:px-4 md:py-6">
      {/* Brand */}
      <Link
        href="/"
        className="mr-2 flex items-center gap-2.5 md:mr-0 md:mb-6 md:px-2"
      >
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-orange via-accent-purple to-accent-teal text-sm font-bold text-black shadow-lg">
          JS
        </span>
        <span className="hidden text-[15px] font-semibold tracking-tight sm:block">
          Practice Vault
        </span>
      </Link>

      <nav className="flex flex-1 flex-row gap-1 md:flex-col">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/[0.06] text-vault-text"
                  : "text-vault-muted hover:bg-white/[0.03] hover:text-vault-text"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-[18px] w-[18px] transition-colors ${
                  active ? "text-accent-orange" : "text-vault-faint group-hover:text-vault-muted"
                }`}
              >
                {item.icon}
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:mt-auto md:block md:px-2 md:pt-6">
        <p className="text-xs leading-relaxed text-vault-faint">
          Your snippets are saved as real{" "}
          <span className="font-mono text-vault-muted">.js</span> files on disk.
        </p>
      </div>
    </aside>
  );
}

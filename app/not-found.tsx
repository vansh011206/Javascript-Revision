import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm text-accent-orange">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Topic not found
        </h1>
        <p className="mt-2 text-sm text-vault-muted">
          That practice file isn&apos;t in your vault (yet).
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-accent-orange to-accent-purple px-4 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03] active:scale-95"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

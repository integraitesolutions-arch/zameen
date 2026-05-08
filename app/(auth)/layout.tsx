import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: "#f4f3f7" }}>
      <Link href="/" className="mb-8 flex items-center gap-1.5">
        <span className="font-heading text-2xl font-bold" style={{ color: "#1a73e8" }}>Zameen</span>
      </Link>
      {children}
    </div>
  );
}

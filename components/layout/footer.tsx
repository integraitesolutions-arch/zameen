import Link from "next/link";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Real Estate News India", href: "/blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Support", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #e8eaed", background: "#ffffff" }}>
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-lg font-bold" style={{ color: "#1a73e8" }}>ZAMINDHAAR</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "#727785" }}>
              Connecting India&apos;s property owners and buyers through trust, transparency, and technology.
            </p>
          </div>

          {/* Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold" style={{ color: "#202124" }}>
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm transition-colors hover:text-[#1a73e8]" style={{ color: "#727785" }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Stay Connected */}
          <div>
            <h4 className="mb-3 text-sm font-semibold" style={{ color: "#202124" }}>Stay Connected</h4>
            <div className="flex gap-3">
              {["X", "in", "fb"].map((social) => (
                <button
                  key={social}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "#1a73e8" }}
                >
                  {social}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 text-center text-xs" style={{ borderTop: "1px solid #e8eaed", color: "#727785" }}>
          &copy; {new Date().getFullYear()} ZAMINDHAAR Real Estate. All rights reserved. Registered with RERA.
        </div>
      </div>
    </footer>
  );
}

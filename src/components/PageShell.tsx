import Link from "next/link";
import Logo from "@/components/Logo";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: "#FAFAF8", display: "flex", flexDirection: "column" }}>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10"
        style={{
          height: 56,
          background: "rgba(250,250,248,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(212,196,168,0.35)",
        }}
      >
        <Logo size="sm" />
        <nav className="hidden md:flex items-center gap-6">
          {[
            { href: "/blog", label: "Blog" },
            { href: "/about", label: "About" },
            { href: "/faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[12px] font-semibold uppercase tracking-widest transition-colors duration-200"
              style={{ color: "#6B6B6B" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/results"
          className="px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "#7A9E74", color: "#FFFFFF" }}
        >
          Start Searching
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      <footer style={{ background: "#0F0F0E", color: "rgba(255,255,255,0.55)" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <p className="text-white font-black text-sm tracking-tighter mb-3">Browse AI</p>
            <p className="text-[12px] leading-relaxed">
              AI-powered fashion discovery across Pakistan&apos;s top brands.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "#7A9E74" }}>Discover</p>
            <ul className="space-y-2 text-[12px]">
              {[
                { href: "/results?q=lawn+suits", label: "Lawn Suits" },
                { href: "/results?q=chiffon+dupatta", label: "Chiffon Dupatta" },
                { href: "/results?q=pret+wear", label: "Pret Wear" },
                { href: "/results?q=formal+wear", label: "Formal Wear" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "#7A9E74" }}>Company</p>
            <ul className="space-y-2 text-[12px]">
              {[
                { href: "/about", label: "About" },
                { href: "/blog", label: "Blog" },
                { href: "/faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: "#7A9E74" }}>Legal</p>
            <ul className="space-y-2 text-[12px]">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-[11px]">© {new Date().getFullYear()} Browse AI. All rights reserved.</p>
          <p className="text-[11px]">Made for Pakistan&apos;s fashion lovers</p>
        </div>
      </footer>
    </div>
  );
}

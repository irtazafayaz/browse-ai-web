import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Browse AI",
  description: "Browse AI's privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  const lastUpdated = "March 12, 2025";
  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] mb-4" style={{ color: "var(--accent)" }}>Legal</p>
          <h1
            className="font-display leading-tight tracking-[-0.02em] mb-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--ink)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Last updated: {lastUpdated}</p>
        </div>

        <div className="legal-prose">
          <p>Browse AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the Browse AI platform at browse-ai.com. This Privacy Policy explains what information we collect, how we use it, and what choices you have.</p>

          <h2>1. Information We Collect</h2>
          <h3>Information you provide</h3>
          <ul>
            <li><strong>Account information:</strong> When you create an account, we collect your name and email address.</li>
            <li><strong>Search queries:</strong> The search text you enter when using Browse AI.</li>
            <li><strong>Saved items:</strong> Products you bookmark or save to your account.</li>
          </ul>
          <h3>Information collected automatically</h3>
          <ul>
            <li><strong>Usage data:</strong> Pages visited, search queries, results clicked, and time spent on the platform.</li>
            <li><strong>Device information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
            <li><strong>Cookies:</strong> We use essential cookies to keep you logged in and analytics cookies (with your consent) to understand how the platform is used.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To operate and improve the search platform</li>
            <li>To personalise search results and product recommendations</li>
            <li>To send you account-related notifications (e.g., password reset)</li>
            <li>To analyse usage patterns and improve performance</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>

          <h2>3. Sharing Your Information</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Service providers:</strong> Third-party vendors who assist with hosting, analytics, and email delivery — subject to confidentiality agreements.</li>
            <li><strong>Legal requirements:</strong> If required by law, court order, or governmental authority.</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets — you will be notified in advance.</li>
          </ul>

          <h2>4. Data Retention</h2>
          <p>We retain your account information for as long as your account is active or as needed to provide services. Search query logs are retained for up to 12 months. You may request deletion of your account and associated data at any time.</p>

          <h2>5. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p>To exercise any of these rights, contact us at privacy@browse-ai.com.</p>

          <h2>6. Cookies</h2>
          <p>We use:</p>
          <ul>
            <li><strong>Essential cookies:</strong> Required for authentication and core functionality. Cannot be disabled.</li>
            <li><strong>Analytics cookies:</strong> Help us understand how users interact with Browse AI. You can opt out via your browser settings.</li>
          </ul>

          <h2>7. Security</h2>
          <p>We implement industry-standard security measures including HTTPS encryption, access controls, and regular security reviews. No method of transmission over the internet is 100% secure — we cannot guarantee absolute security.</p>

          <h2>8. Children</h2>
          <p>Browse AI is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it.</p>

          <h2>9. Changes to This Policy</h2>
          <p>We may update this policy periodically. We will notify registered users of material changes by email. Continued use of Browse AI after changes constitutes acceptance of the updated policy.</p>

          <h2>10. Contact</h2>
          <p>For privacy-related questions or requests: <strong>privacy@browse-ai.com</strong></p>
        </div>
      </div>

      <style>{`
        .legal-prose h2 { font-family: var(--font-archivo-black), sans-serif; font-size: 1.3rem; font-weight: 600; color: var(--ink); margin: 2rem 0 0.6rem; }
        .legal-prose h3 { font-size: 0.875rem; font-weight: 700; color: var(--ink); margin: 1.2rem 0 0.4rem; }
        .legal-prose p { font-size: 0.9rem; line-height: 1.8; color: var(--ink-muted); margin: 0 0 1rem; }
        .legal-prose ul { margin: 0.5rem 0 1rem 1.4rem; list-style: disc; }
        .legal-prose li { font-size: 0.88rem; line-height: 1.75; color: var(--ink-muted); margin-bottom: 0.3rem; }
        .legal-prose strong { font-weight: 700; color: var(--ink); }
      `}</style>
    </PageShell>
  );
}

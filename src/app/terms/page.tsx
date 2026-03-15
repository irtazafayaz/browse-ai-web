import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service — Browse AI",
  description: "Browse AI's terms of service — the rules governing use of the platform.",
};

export default function TermsPage() {
  const lastUpdated = "March 12, 2025";
  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-16">
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] mb-4" style={{ color: "#7A9E74" }}>Legal</p>
          <h1
            className="font-cormorant font-semibold italic leading-tight tracking-[-0.02em] mb-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#0F0F0E" }}
          >
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: "#AAAAAA" }}>Last updated: {lastUpdated}</p>
        </div>

        <div className="legal-prose">
          <p>These Terms of Service (&quot;Terms&quot;) govern your use of Browse AI (&quot;the Platform&quot;). By accessing or using Browse AI, you agree to be bound by these Terms.</p>

          <h2>1. The Service</h2>
          <p>Browse AI is a fashion discovery platform that uses artificial intelligence to help users find clothing and accessories from Pakistani fashion brands. We do not sell products directly — we link users to third-party retailer websites where purchases are completed.</p>

          <h2>2. Eligibility</h2>
          <p>You must be at least 13 years old to use Browse AI. By using the platform, you represent that you meet this requirement. If you are under 18, you confirm you have parental consent to use the service.</p>

          <h2>3. User Accounts</h2>
          <ul>
            <li>You may use Browse AI without an account. Creating an account enables bookmarking and personalisation features.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must provide accurate information when creating an account.</li>
            <li>You may not share your account with others or create accounts on behalf of others.</li>
          </ul>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use Browse AI for any unlawful purpose</li>
            <li>Attempt to reverse-engineer, scrape, or extract data from the platform at scale</li>
            <li>Interfere with or disrupt the platform&apos;s infrastructure</li>
            <li>Impersonate any person or entity</li>
            <li>Upload or transmit malicious code</li>
            <li>Attempt to gain unauthorised access to any part of the platform</li>
          </ul>

          <h2>5. Third-Party Retailers</h2>
          <p>Browse AI links to third-party brand websites. We are not responsible for:</p>
          <ul>
            <li>The accuracy of product information, pricing, or availability on third-party sites</li>
            <li>The quality, safety, or legality of products sold by third parties</li>
            <li>Transactions, returns, or disputes between you and third-party retailers</li>
          </ul>
          <p>Your purchases from third-party retailers are governed by their own terms and policies.</p>

          <h2>6. Intellectual Property</h2>
          <p>All content, design, and technology on Browse AI — including our AI models, search algorithms, user interface, and branding — is owned by Browse AI and protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          <p>Product images and descriptions displayed in search results are the property of their respective brand owners and are used for indexing and discovery purposes.</p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>Browse AI is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or that search results will be complete or accurate.</p>

          <h2>8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Browse AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform or your reliance on search results. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim (which may be zero for free users).</p>

          <h2>9. Changes to the Service</h2>
          <p>We may modify, suspend, or discontinue any part of Browse AI at any time. We will provide reasonable notice of material changes where practicable.</p>

          <h2>10. Changes to These Terms</h2>
          <p>We may update these Terms periodically. Continued use of Browse AI after changes constitutes acceptance of the updated Terms. We will notify registered users of material changes by email.</p>

          <h2>11. Governing Law</h2>
          <p>These Terms are governed by the laws of Pakistan. Any disputes shall be resolved in the courts of Lahore, Pakistan, unless otherwise required by applicable consumer protection law in your jurisdiction.</p>

          <h2>12. Contact</h2>
          <p>For questions about these Terms: <strong>legal@browse-ai.com</strong></p>
        </div>
      </div>

      <style>{`
        .legal-prose h2 { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.3rem; font-weight: 600; font-style: italic; color: #0F0F0E; margin: 2rem 0 0.6rem; }
        .legal-prose h3 { font-size: 0.875rem; font-weight: 700; color: #0F0F0E; margin: 1.2rem 0 0.4rem; }
        .legal-prose p { font-size: 0.9rem; line-height: 1.8; color: #4A4A4A; margin: 0 0 1rem; }
        .legal-prose ul { margin: 0.5rem 0 1rem 1.4rem; list-style: disc; }
        .legal-prose li { font-size: 0.88rem; line-height: 1.75; color: #4A4A4A; margin-bottom: 0.3rem; }
        .legal-prose strong { font-weight: 700; color: #0F0F0E; }
      `}</style>
    </PageShell>
  );
}

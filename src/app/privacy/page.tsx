import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, EyeOff, Server, HardDrive, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - ToS & Privacy Risk Analyzer',
  description: 'Our commitment to zero data retention, ephemeral in-memory audits, and total privacy transparency.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-emerald-600/20 via-indigo-600/10 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Analyzer</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Grade A+ Policy
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Consumer-First Privacy Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: September 2026 • Version 1.2 (Zero-Log Architecture)</p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/80 border border-emerald-500/20 p-5 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">No Tracking & No Ads</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We do not use tracking cookies, advertising pixels, session recording scripts, or device fingerprinting.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-indigo-500/20 p-5 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Ephemeral Processing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Uploaded text and scraped URLs are processed strictly in server memory during your request and never saved to a database.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-blue-500/20 p-5 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Local-Only History</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your audit history is stored exclusively in your browser's private <code className="text-indigo-300">localStorage</code>. It never leaves your device.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-rose-500/20 p-5 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">No Data Selling</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We will never sell, rent, monetize, or broker any user data, search queries, or submitted documents to any third party.
            </p>
          </div>
        </div>

        {/* Detailed Clauses */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              When you use the <strong>ToS and Privacy Risk Analyzer</strong>, we collect only the minimal data necessary to provide the service:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li><strong>User-Provided Text / URLs:</strong> Legal agreement text, uploaded PDF documents, or website URLs submitted for risk analysis.</li>
              <li><strong>Chat Queries:</strong> Questions asked inside the interactive "Ask AI About This Policy" drawer.</li>
              <li><strong>No Personal Identifiers:</strong> We do not ask for or collect names, email addresses, phone numbers, or passwords.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. How Your Data Is Processed</h2>
            <p>
              When you request an audit:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-300">
              <li>Your submitted policy text is securely transmitted via TLS 1.3 encrypted HTTPS to our stateless API route.</li>
              <li>The text is sent to Google Gemini via API for structured legal risk evaluation. Google does not use API customer submissions to train base foundation models under enterprise API terms.</li>
              <li>The structured risk score and red-flag report are sent directly back to your browser and immediately discarded from our server memory.</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Third-Party Service Providers</h2>
            <p>We work only with reputable infrastructure partners to deliver the analyzer:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li><strong>Vercel Inc.:</strong> Hosting platform and edge serverless execution.</li>
              <li><strong>Google Gemini API:</strong> Large Language Model engine used exclusively for legal clause parsing and classification.</li>
              <li><strong>Jina Reader API:</strong> Fallback parser used exclusively to extract public text from websites protected by anti-bot walls.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Cookies & Analytics</h2>
            <p>
              We do <strong>NOT</strong> use tracking cookies, Google Analytics, Facebook Pixels, or cross-site tracking beacons. Your session is 100% ephemeral and anonymous.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Your Data Rights & Deletion</h2>
            <p>
              Because we store zero personal data on our servers, there is no database record of your identity. To clear your past search and audit history, simply click the <strong>"Clear All History"</strong> button inside the "Past Audits" modal in your browser.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">6. Contact & Inquiries</h2>
            <p>
              If you have any questions or feedback regarding this Privacy Policy, you can open an issue or pull request on our open-source GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

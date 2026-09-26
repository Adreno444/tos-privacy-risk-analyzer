import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, HeartHandshake, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - ToS & Privacy Risk Analyzer',
  description: 'Fair, transparent terms with no mandatory arbitration, no hidden traps, and full user ownership.',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      {/* Navigation Header */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 flex items-center justify-center text-xs font-bold select-none">
              𓍝
            </div>
            <span>Back to Analyzer</span>
          </Link>

          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            Terms of Service
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-zinc-500">Last updated: September 2026 • Plain English & Pro-Consumer</p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>No Arbitration Trap</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We never force mandatory arbitration or waive your right to legal relief.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold uppercase">
              <HeartHandshake className="w-3.5 h-3.5 text-zinc-400" />
              <span>Full Ownership</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              You retain 100% ownership and rights over all documents or text you scan.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold uppercase">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Educational Tool</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our audits provide educational analysis and do not constitute formal legal counsel.
            </p>
          </div>
        </div>

        {/* Full Terms Content */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-5 text-xs sm:text-sm leading-relaxed text-zinc-300">
          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="text-zinc-400">
              By accessing the <strong>ToS & Privacy Risk Analyzer</strong> ("Service"), you agree to these Terms. If you disagree with any portion, you are free to discontinue use of the Service at any time.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold text-white">2. Nature of the Service & Disclaimer</h2>
            <p className="text-zinc-400">
              The Service is an automated research and educational tool created to extract and summarize clauses in public legal documents. The generated outputs do not constitute formal legal advice or attorney-client representation.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold text-white">3. Intellectual Property & Submitted Content</h2>
            <p className="text-zinc-400">
              You retain all proprietary rights, ownership, and copyright over any legal text, PDF files, or documents you submit to the Service. We claim no commercial license or ownership rights over your submitted data.
            </p>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold text-white">4. Open Source & Community</h2>
            <p className="text-zinc-400">
              The codebase powering this tool is built for public transparency and consumer empowerment.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

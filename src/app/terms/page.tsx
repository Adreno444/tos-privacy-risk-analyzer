import React from 'react';
import Link from 'next/link';
import { Scale, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, HeartHandshake } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - ToS & Privacy Risk Analyzer',
  description: 'Fair, transparent terms with no mandatory arbitration, no hidden traps, and full user ownership.',
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-600/20 via-rose-600/10 to-transparent blur-3xl opacity-70" />
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
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Fair & Transparent
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Fair Consumer Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: September 2026 • Plain English & Pro-Consumer</p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-emerald-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>No Arbitration Trap</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We never force mandatory arbitration or waive your legal rights to jury trials or collective relief.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-indigo-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase mb-1">
              <HeartHandshake className="w-4 h-4" />
              <span>100% User Ownership</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You retain full ownership and intellectual property of any documents or text you scan.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-amber-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Educational Tool</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our AI audits provide rapid educational analysis and do not constitute formal legal counsel.
            </p>
          </div>
        </div>

        {/* Full Terms Content */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-sm leading-relaxed text-slate-300">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the <strong>ToS and Privacy Risk Analyzer</strong> ("Service"), you agree to be bound by these Terms of Service. If you disagree with any portion, you are free to discontinue use of the Service at any time without penalty.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Nature of the Service & Legal Disclaimer</h2>
            <p>
              The Service is an AI-powered educational and research tool created to summarize, extract, and categorize risk clauses in publicly available legal documents.
            </p>
            <p className="text-xs text-amber-300/90 bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl">
              <strong>Notice:</strong> The AI scores, letter grades, and red-flag extractions generated by this application are for informational and educational awareness only. They do not constitute formal legal advice, attorney-client representation, or guaranteed regulatory compliance opinions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Intellectual Property & Your Content</h2>
            <p>
              You retain all proprietary rights, ownership, and copyright over any legal text, PDF files, or documents you submit to the Service. We do not claim any copyright, commercial license, or resale rights to your submitted data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Fair & Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li>Launch automated denial-of-service (DDoS) attacks against the API infrastructure.</li>
              <li>Attempt to reverse-engineer private API credentials or bypass security controls.</li>
              <li>Use the analyzer for unlawful surveillance, harassment, or malicious scraping.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Fair Modifications of Terms</h2>
            <p>
              If we make material changes to these Terms, we will update the "Last updated" date above. We will never introduce retroactive rights forfeitures, hidden subscription traps, or forced arbitration waivers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">6. Open Source & Community</h2>
            <p>
              The code powering this tool is built for the public good to empower consumers and protect digital rights.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

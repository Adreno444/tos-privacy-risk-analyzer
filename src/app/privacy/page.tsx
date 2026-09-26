import React from 'react';
import Link from 'next/link';
import { ArrowLeft, EyeOff, Server, HardDrive, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - ToS & Privacy Risk Analyzer',
  description: 'Our commitment to zero data retention, ephemeral in-memory audits, and total privacy transparency.',
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-zinc-500">Last updated: September 2026 • Zero-Log Architecture</p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <EyeOff className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-200">No Tracking & No Ads</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We do not use tracking cookies, advertising pixels, session recording scripts, or device fingerprinting.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <Server className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-200">Ephemeral Processing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Uploaded text and scraped URLs are processed strictly in server memory during your request and never stored in a database.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-200">Local-Only History</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your audit history is stored exclusively in your browser's private <code className="text-zinc-300">localStorage</code>.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-200">No Data Selling</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We never sell, rent, monetize, or broker any user queries or submitted documents to any third party.
            </p>
          </div>
        </div>

        {/* Detailed Clauses */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-5 text-xs sm:text-sm leading-relaxed text-zinc-300">
          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold text-white">1. Information We Collect</h2>
            <p className="text-zinc-400">
              When you use the <strong>ToS and Privacy Risk Analyzer</strong>, we process only the data necessary to provide an audit:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-400">
              <li><strong>User-Provided Text / URLs:</strong> Legal agreement text, uploaded PDF documents, or website URLs submitted for analysis.</li>
              <li><strong>Chat Queries:</strong> Questions asked inside the interactive policy assistant.</li>
              <li><strong>No Personal Identifiers:</strong> We do not collect names, email addresses, phone numbers, or account credentials.</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold text-white">2. Processing Pipeline</h2>
            <ol className="list-decimal pl-4 space-y-1 text-xs text-zinc-400">
              <li>Policy text is securely transmitted via TLS 1.3 HTTPS to our serverless route.</li>
              <li>The text is sent to Google Gemini via API for structured legal risk evaluation.</li>
              <li>The structured risk score and report are returned directly to your browser and immediately discarded from memory.</li>
            </ol>
          </section>

          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold text-white">3. Third-Party Infrastructure</h2>
            <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-400">
              <li><strong>Vercel:</strong> Serverless hosting and edge execution.</li>
              <li><strong>Google Gemini API:</strong> Model engine used for legal clause parsing.</li>
              <li><strong>Jina Reader API:</strong> Fallback parser for extracting public text when sites block direct scrapers.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

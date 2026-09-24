'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnalysisReport } from '@/types/analyzer';
import { SAMPLE_POLICIES } from '@/data/samplePolicies';
import { AnalysisResults } from '@/components/AnalysisResults';
import { PdfDropzone } from '@/components/PdfDropzone';
import { ScanHistoryModal } from '@/components/ScanHistoryModal';
import {
  ShieldAlert,
  FileText,
  Sparkles,
  Link2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  Zap,
  BookOpen,
  UploadCloud,
  History,
  Compass,
} from 'lucide-react';

const AnimatedLetters = ({
  text,
  className = '',
  baseDelay = 0,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
}) => {
  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="animate-letter inline-block"
          style={{
            animationDelay: `${baseDelay + index * 0.025}s`,
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default function Home() {
  const [tab, setTab] = useState<'url' | 'pdf' | 'paste' | 'samples'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [docNameInput, setDocNameInput] = useState('');
  const [activeRawText, setActiveRawText] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleAnalyzeText = async (textToAnalyze: string, name: string) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 50) {
      setError('Please provide at least 50 characters of legal agreement text.');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep('Auditing legal clauses and calculating consumer risk scores...');
    setActiveRawText(textToAnalyze);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          documentName: name || 'Terms of Service / Privacy Document',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze document.');
      }

      setReport(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleAnalyzeUrl = async () => {
    const rawUrl = urlInput.trim();
    if (!rawUrl) {
      setError('Please enter a website link or policy URL (e.g. netflix.com, spotify.com, or https://example.com/terms)');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep('Discovering & extracting legal policies from website...');

    try {
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });

      const scrapeData = await scrapeRes.json();
      if (!scrapeRes.ok) {
        throw new Error(scrapeData.error || 'Failed to fetch the URL.');
      }

      setActiveRawText(scrapeData.text);
      setLoadingStep('Deep scanning clauses, waivers, and privacy risks...');

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scrapeData.text,
          documentName: docNameInput || scrapeData.title || rawUrl,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Failed to analyze legal text.');
      }

      // Attach discoveredPages to the report
      if (scrapeData.discoveredPages && scrapeData.discoveredPages.length > 0) {
        analyzeData.discoveredPages = scrapeData.discoveredPages;
      }

      setReport(analyzeData);
    } catch (err: any) {
      setError(err.message || 'Error occurred while processing.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handlePdfExtracted = (extractedText: string, fileName: string) => {
    setDocNameInput(fileName);
    handleAnalyzeText(extractedText, fileName);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-24">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-600/20 via-rose-600/10 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-indigo-500 text-white shadow-lg shadow-rose-500/20 flex items-center justify-center text-lg font-bold select-none border border-white/10">
              𓍝
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                ToS & Privacy Risk Analyzer
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  AI Powered
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Past Audits</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {!report ? (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant Legal & Privacy Red-Flag Audit</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                <AnimatedLetters text="Know What You Agree To" baseDelay={0.05} />
                <br />
                <span className="bg-gradient-to-r from-rose-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  <AnimatedLetters text='Before Clicking "I Agree"' baseDelay={0.65} />
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                Scan Terms of Service, Privacy Policies, and EULAs. Enter any link, PDF, or text to instantly expose hidden risks.
              </p>
            </div>

            {/* Input Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 max-w-xl mx-auto">
                <button
                  onClick={() => setTab('url')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Website / Link
                </button>
                <button
                  onClick={() => setTab('pdf')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'pdf' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload PDF
                </button>
                <button
                  onClick={() => setTab('paste')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'paste' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Text
                </button>
                <button
                  onClick={() => setTab('samples')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'samples' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Sample Demos
                </button>
              </div>

              {/* Tab 1: URL / Link Input */}
              {tab === 'url' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center justify-between">
                      <span>Website Link or Terms/Privacy URL</span>
                      <span className="text-[11px] text-indigo-400 font-normal flex items-center gap-1">
                        <Compass className="w-3 h-3" /> Auto-discovers policy subpages
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. netflix.com, spotify.com/legal, or https://openai.com/policies/terms-of-use"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading) {
                            handleAnalyzeUrl();
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                      Company / App Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Netflix, Spotify, Discord, Reddit"
                      value={docNameInput}
                      onChange={(e) => setDocNameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzeUrl}
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || 'Processing...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Scan Link & Legal Policies</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 2: PDF Drag and Drop */}
              {tab === 'pdf' && (
                <div>
                  <PdfDropzone onPdfExtracted={handlePdfExtracted} />
                </div>
              )}

              {/* Tab 3: Paste Raw Text */}
              {tab === 'paste' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                      Document Title / Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme SaaS Terms of Service"
                      value={docNameInput}
                      onChange={(e) => setDocNameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                      Paste Legal Document Text
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Paste clauses, terms of service, privacy policies, or EULA text here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                    <div className="text-[11px] text-slate-500 text-right mt-1">
                      {textInput.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>

                  <button
                    onClick={() => handleAnalyzeText(textInput, docNameInput)}
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || 'Analyzing...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Audit Pasted Legal Text</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 4: Sample Demo Policies */}
              {tab === 'samples' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <p className="text-xs text-slate-400 text-center">
                    Select a pre-loaded sample agreement to test the analyzer instantly:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {SAMPLE_POLICIES.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => {
                          setDocNameInput(sample.name);
                          handleAnalyzeText(sample.sampleText, sample.name);
                        }}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:bg-slate-900/80 group flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {sample.category}
                            </span>
                            <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {sample.name}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-400">{sample.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 max-w-2xl mx-auto">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Deep Red-Flag Scanner</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts AI model training on user data, mandatory arbitration, class-action waivers, and data broker sales.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Link & Domain Crawler</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter any domain or homepage link; our crawler automatically navigates and aggregates all legal policy pages.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Rights Matrix & Opt-Outs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generates an imbalance matrix comparing rights you forfeit vs rights the company asserts, with clear opt-out steps.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <AnalysisResults
            report={report}
            rawText={activeRawText}
            onReset={() => {
              setReport(null);
              setActiveRawText('');
            }}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800/80 pt-8 text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ToS & Privacy Risk Analyzer</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              Zero-Log Ephemeral Audits
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <a
              href="https://github.com/Adreno444/tos-privacy-risk-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>

      {/* History Modal */}
      <ScanHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectReport={(selectedReport) => {
          setReport(selectedReport);
        }}
      />
    </main>
  );
}

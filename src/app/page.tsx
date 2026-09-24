'use client';

import React, { useState } from 'react';
import { AnalysisReport } from '@/types/analyzer';
import { SAMPLE_POLICIES } from '@/data/samplePolicies';
import { AnalysisResults } from '@/components/AnalysisResults';
import {
  ShieldAlert,
  Search,
  FileText,
  Sparkles,
  Link2,
  Key,
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  Zap,
  BookOpen,
} from 'lucide-react';

export default function Home() {
  const [tab, setTab] = useState<'url' | 'paste' | 'samples'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [docNameInput, setDocNameInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const handleAnalyzeText = async (textToAnalyze: string, name: string) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 50) {
      setError('Please provide at least 50 characters of legal agreement text.');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep('Analyzing legal clauses with Groq Llama 3.3 70B...');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          documentName: name || 'Terms of Service / Privacy Document',
          apiKey: apiKeyInput || undefined,
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
    if (!urlInput || !urlInput.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep('Fetching & scraping policy content from URL...');

    try {
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      const scrapeData = await scrapeRes.json();
      if (!scrapeRes.ok) {
        throw new Error(scrapeData.error || 'Failed to fetch the URL.');
      }

      setLoadingStep('Auditing extracted clauses with Groq Llama 3.3 70B...');

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scrapeData.text,
          documentName: docNameInput || scrapeData.title || new URL(urlInput).hostname,
          apiKey: apiKeyInput || undefined,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Failed to analyze legal text.');
      }

      setReport(analyzeData);
    } catch (err: any) {
      setError(err.message || 'Error occurred while processing.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
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
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                ToS & Privacy Risk Analyzer
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Groq 70B
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{apiKeyInput ? 'Custom Key Set' : 'Groq API Key'}</span>
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
                <span>Instant Red-Flag & Clause Audit Powered by Groq</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Know What You Agree To <br />
                <span className="bg-gradient-to-r from-rose-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  Before Clicking "I Agree"
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Scan Terms of Service, Privacy Policies, and EULAs. Automatically expose hidden surveillance,
                mandatory arbitration, IP forfeitures, and auto-renewals with exact quotes.
              </p>
            </div>

            {/* Input Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 max-w-md mx-auto">
                <button
                  onClick={() => setTab('url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Website URL
                </button>
                <button
                  onClick={() => setTab('paste')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'paste' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Text
                </button>
                <button
                  onClick={() => setTab('samples')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    tab === 'samples' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Sample Demos
                </button>
              </div>

              {/* Tab 1: URL Input */}
              {tab === 'url' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                      Terms / Privacy Policy URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://example.com/terms or https://service.com/privacy"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
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
                      placeholder="e.g. Netflix, Spotify, Discord"
                      value={docNameInput}
                      onChange={(e) => setDocNameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzeUrl}
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || 'Processing...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Live URL</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 2: Paste Raw Text */}
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
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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

              {/* Tab 3: Sample Demo Policies */}
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
                <h3 className="text-sm font-bold text-white mb-1">Red-Flag Hunter</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Spots mandatory arbitration, waiver of jury trials, selling personal data, and perpetual copyright grants.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Groq Ultra-Fast AI</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts structured JSON reports in seconds using Llama 3.3 70B with 128k context support.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">100% Client/Serverless</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Vercel native route handlers with zero tracking and privacy-preserving ephemeral audits.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <AnalysisResults report={report} onReset={() => setReport(null)} />
        )}
      </div>

      {/* Groq API Key Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Key className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Custom Groq API Key</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If the server's default Groq API key is not configured, you can provide your own Groq API key (starts with <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">gsk_</code>).
              Get one for free at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">console.groq.com</a>.
            </p>
            <input
              type="password"
              placeholder="gsk_..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

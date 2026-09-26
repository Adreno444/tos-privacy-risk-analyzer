'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnalysisReport } from '@/types/analyzer';
import { SAMPLE_POLICIES } from '@/data/samplePolicies';
import { AnalysisResults } from '@/components/AnalysisResults';
import { PdfDropzone } from '@/components/PdfDropzone';
import { ScanHistoryModal } from '@/components/ScanHistoryModal';
import {
  FileText,
  Link2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  UploadCloud,
  History,
  Compass,
} from 'lucide-react';

const AnimatedLetters = ({
  text,
  baseDelay = 0,
}: {
  text: string;
  baseDelay?: number;
}) => {
  return (
    <>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="animate-char"
          style={{
            animationDelay: `${baseDelay + index * 0.015}s`,
          }}
        >
          {char}
        </span>
      ))}
    </>
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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Smooth simulated progress timer for analysis operations
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setProgress(12);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + Math.floor(Math.random() * 8) + 4;
          if (prev < 75) return prev + Math.floor(Math.random() * 5) + 2;
          if (prev < 92) return prev + 1;
          return prev;
        });
      }, 450);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyzeText = async (textToAnalyze: string, name: string) => {
    if (!textToAnalyze || textToAnalyze.trim().length < 50) {
      setError('Please provide at least 50 characters of legal agreement text.');
      return;
    }

    setError(null);
    setLoading(true);
    setProgress(15);
    setLoadingStep('Auditing clauses & evaluating privacy risks...');
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

      setProgress(100);
      setTimeout(() => {
        setReport(data);
      }, 300);
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
      setError('Please enter a website or policy URL (e.g. netflix.com, spotify.com, or https://example.com/terms)');
      return;
    }

    setError(null);
    setLoading(true);
    setProgress(10);
    setLoadingStep('Extracting legal policies from domain...');

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
      setProgress(50);
      setLoadingStep('Analyzing clauses, waivers, and privacy risks...');

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

      if (scrapeData.discoveredPages && scrapeData.discoveredPages.length > 0) {
        analyzeData.discoveredPages = scrapeData.discoveredPages;
      }

      setProgress(100);
      setTimeout(() => {
        setReport(analyzeData);
      }, 300);
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
    <main className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
      {/* Navigation Header */}
      <header className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="Refresh Analyzer"
          >
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 flex items-center justify-center text-sm font-bold group-hover:border-zinc-600 transition-colors">
              𓍝
            </div>
            <h1 className="font-semibold text-sm tracking-tight text-zinc-100 flex items-center gap-2 group-hover:text-white transition-colors">
              ToS & Privacy Analyzer
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                AI
              </span>
            </h1>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>Past Audits</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {!report ? (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium">
                <span>Legal & Privacy Risk Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                <span className="animate-hero-title">
                  <AnimatedLetters text="Know What You Agree To" baseDelay={0.05} />
                </span>
                <br />
                <span className="animate-hero-line2 text-zinc-400 font-normal">
                  <AnimatedLetters text='Before Clicking "I Agree"' baseDelay={0.2} />
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                Scan Terms of Service, Privacy Policies, and EULAs. Enter a link, PDF, or text to evaluate data rights, arbitration clauses, and tracking risks.
              </p>
            </div>

            {/* Input Card */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 sm:p-7 space-y-6">
              {/* Tab Selector */}
              <div className="flex p-1 bg-zinc-950 rounded-lg border border-zinc-800 max-w-md mx-auto">
                <button
                  onClick={() => setTab('url')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tab === 'url' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  URL
                </button>
                <button
                  onClick={() => setTab('pdf')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tab === 'pdf' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  PDF
                </button>
                <button
                  onClick={() => setTab('paste')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tab === 'paste' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Text
                </button>
                <button
                  onClick={() => setTab('samples')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    tab === 'samples' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Samples
                </button>
              </div>

              {/* Tab 1: URL / Link Input */}
              {tab === 'url' && (
                <div className="space-y-4 max-w-xl mx-auto">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center justify-between">
                      <span>Website Domain or Policy Link</span>
                      <span className="text-[11px] text-zinc-500 font-normal flex items-center gap-1">
                        <Compass className="w-3 h-3" /> Auto-discovers subpages
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. netflix.com, spotify.com, or https://openai.com/policies/terms-of-use"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading) {
                          handleAnalyzeUrl();
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Company / App Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Netflix, Spotify, Discord"
                      value={docNameInput}
                      onChange={(e) => setDocNameInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleAnalyzeUrl}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || 'Processing...'}</span>
                      </>
                    ) : (
                      <span>Analyze Policy</span>
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
                <div className="space-y-4 max-w-xl mx-auto">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Document Title / Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SaaS Agreement"
                      value={docNameInput}
                      onChange={(e) => setDocNameInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Paste Legal Document Text
                    </label>
                    <textarea
                      rows={7}
                      placeholder="Paste clauses, terms of service, privacy policies, or EULA text here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono transition-colors"
                    />
                    <div className="text-[11px] text-zinc-500 text-right mt-1">
                      {textInput.split(/\s+/).filter(Boolean).length} words
                    </div>
                  </div>

                  <button
                    onClick={() => handleAnalyzeText(textInput, docNameInput)}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingStep || 'Analyzing...'}</span>
                      </>
                    ) : (
                      <span>Analyze Text</span>
                    )}
                  </button>
                </div>
              )}

              {/* Tab 4: Sample Demo Policies */}
              {tab === 'samples' && (
                <div className="space-y-3 max-w-xl mx-auto">
                  <p className="text-xs text-zinc-400 text-center">
                    Select a sample policy to test the analyzer:
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {SAMPLE_POLICIES.map((sample) => (
                      <div
                        key={sample.id}
                        onClick={() => {
                          setDocNameInput(sample.name);
                          handleAnalyzeText(sample.sampleText, sample.name);
                        }}
                        className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors hover:bg-zinc-900/60 group flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {sample.category}
                            </span>
                            <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                              {sample.name}
                            </h4>
                          </div>
                          <p className="text-xs text-zinc-500">{sample.description}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Progress Bar */}
              {loading && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 max-w-xl mx-auto transition-all animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                      <span>{loadingStep || 'Analyzing legal terms...'}</span>
                    </span>
                    <span className="text-zinc-400 font-semibold">{Math.min(progress, 100)}%</span>
                  </div>

                  {/* Progress Track */}
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                    <div
                      className="h-full bg-zinc-200 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-0.5">
                    <span>
                      {progress < 40
                        ? '1/3 Document Ingestion'
                        : progress < 80
                        ? '2/3 Clause Auditing & Risk Scoring'
                        : '3/3 Rights Matrix & Finalizing'}
                    </span>
                    <span>AI Reasoning</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs flex items-start gap-2.5 max-w-xl mx-auto">
                  <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-zinc-200 mb-1">Clause Auditing</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Evaluates AI model training permissions, mandatory arbitration, class-action waivers, and data sharing.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-zinc-200 mb-1">Domain Discovery</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter any domain to automatically extract and aggregate associated privacy and legal policy pages.
                </p>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-xl">
                <h3 className="text-xs font-semibold text-zinc-200 mb-1">Rights Analysis</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Generates an imbalance matrix comparing rights surrendered against powers asserted by the service.
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
      <footer className="mt-20 border-t border-zinc-800/80 pt-6 text-xs text-zinc-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-400">ToS & Privacy Analyzer</span>
            <span>•</span>
            <span className="text-zinc-500">
              Ephemeral In-Memory Audits
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <a
              href="https://github.com/Adreno444/tos-privacy-risk-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              GitHub
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

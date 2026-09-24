# 𓍝 ToS & Privacy Risk Analyzer

An AI-powered legal compliance and digital rights auditor that scans **Terms of Service (ToS)**, **EULAs**, and **Privacy Policies** to instantly expose predatory clauses, hidden surveillance terms, mandatory arbitration, unilateral changes, and anti-consumer practices.

Built with **Next.js 15 (App Router)**, **Tailwind CSS**, **TypeScript**, and **Google Gemini AI (`@google/genai`)**. Fully ready for 1-click deployment on **Vercel**.

---

## ⚡ Core Capabilities & Features

- 🌐 **Intelligent Link & Domain Discovery**: Enter any link or naked domain (e.g. `netflix.com`, `spotify.com`) — our crawler automatically discovers and aggregates all connected legal policies (Terms of Service, Privacy Policy, EULAs, Cookie Guidelines).
- 🛡️ **Anti-Bot & Web Search Fallbacks**: Emulates full browser headers with automatic fallback to **Jina Reader** and **Autonomous DuckDuckGo Public Search** when sites enforce Cloudflare or geo-blocks.
- 📄 **PDF Drag & Drop Uploader**: Directly extract and audit contracts or agreements from uploaded `.pdf` documents using `unpdf`.
- ⚡ **Google Gemini AI Engine**: Structured legal risk evaluations powered by live dynamic model discovery (`gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-pro`).
- 🚨 **Deep Risk Hunter (9 Major Categories)**:
  1. AI Training on user data, prompts, and media
  2. Data selling, data brokers & third-party ad networks
  3. Forced mandatory arbitration, class-action bans & jury trial waivers
  4. Unilateral policy, fee & privacy changes without notice
  5. Dark patterns, hidden auto-renewals & cancellation traps
  6. Perpetual IP & commercial licensing overreach
  7. Arbitrary account termination & data deletion
  8. Broad indemnification & total liability disclaimers ($0/$50 caps)
  9. Biometric surveillance & telemetry tracking
- ⚖️ **Rights Imbalance Matrix**: Breaks down exactly **"Rights You Give Up / Waive"** vs. **"Rights & Powers The Company Asserts"**.
- 📋 **Consumer Protection & Opt-Out Action Plan**: Step-by-step instructions for arbitration opt-outs, written notice deadlines, and privacy settings.
- 💬 **"Ask AI About This Policy" Interactive Drawer**: Ask contextual questions directly about the audited agreement.
- 🕒 **Private Local History**: Browse past audits stored exclusively in your browser's private `localStorage`.
- 🔒 **Grade A+ Zero-Log Privacy Architecture**: Uploaded text is processed ephemerally in server memory and immediately discarded.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **AI Engine**: [Google Gen AI SDK (`@google/genai`)](https://ai.google.dev/)
- **Scraper**: [Cheerio](https://cheerio.js.org/) & Multi-Tier Fallback Pipeline
- **PDF Engine**: [unpdf](https://github.com/unjs/unpdf)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com)

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/Adreno444/tos-privacy-risk-analyzer.git
cd tos-privacy-risk-analyzer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure your Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can get a free API key at [Google AI Studio](https://aistudio.google.com/))*.

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. Push this repository to your GitHub account.
2. Go to [vercel.com](https://vercel.com) and import your `tos-privacy-risk-analyzer` repository.
3. Under **Settings > Environment Variables**, add:
   - `GEMINI_API_KEY` = your Google Gemini API key
4. Click **Deploy**. Your app will be live on your `.vercel.app` domain in under a minute!

---

## 📜 License & Consumer Rights

MIT License. Built for the public good to empower consumers and protect digital rights.

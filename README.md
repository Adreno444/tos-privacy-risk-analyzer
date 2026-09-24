# 🛡️ ToS and Privacy Risk Analyzer

An AI-powered legal compliance and digital rights auditor that scans **Terms of Service (ToS)**, **EULAs**, and **Privacy Policies** to instantly expose predatory clauses, sneaky surveillance terms, mandatory arbitration, unilateral changes, and anti-consumer practices.

Built with **Next.js 16 (App Router)**, **Tailwind CSS**, **TypeScript**, and **Groq AI (Llama 3.3 70B)**. Fully ready for 1-click deployment on **Vercel**.

---

## ⚡ Features

- 🔍 **Live URL Scraping**: Automatically extracts and cleans legal policy text directly from website links.
- 📋 **Paste & Upload**: Audit custom contract snippets, EULAs, or raw policy text.
- ⚡ **Groq Llama 3.3 70B Engine**: Sub-second legal analysis with structured JSON schema outputs.
- 🚨 **Red-Flag Hunter**: Flags:
  - Data selling & 3rd-party ad broker monetization
  - Forced mandatory arbitration & class-action waivers
  - Perpetual intellectual property waivers on user content
  - Unilateral modification rights & silent changes
  - Dark patterns, hidden auto-renewals & billing traps
  - AI training on user files/prompts
- 📊 **Privacy Scorecard & Letter Grade**: Generates a 0–100 Risk Score, A+ to F Letter Grade, and exact clause quote references.
- 💾 **Exportable Reports**: Export structured JSON audit reports for compliance documentation.
- 🚀 **100% Vercel Native**: Serverless API route handlers with zero Python cold starts.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI / LLM**: [Groq SDK](https://console.groq.com) (llama-3.3-70b-versatile)
- **Scraper**: [Cheerio](https://cheerio.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com)

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
`ash
git clone https://github.com/YOUR_USERNAME/tos-privacy-risk-analyzer.git
cd tos-privacy-risk-analyzer
`

### 2. Install dependencies
`ash
npm install
`

### 3. Configure your Environment Variables
Create a .env.local file in the root directory:
`env
GROQ_API_KEY=gsk_your_groq_api_key_here
`
*(You can get a free API key at [console.groq.com](https://console.groq.com))*.

### 4. Run the development server
`ash
npm run dev
`
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🌐 Deploying to Vercel

1. Push this repository to your GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
3. Import your 	os-privacy-risk-analyzer repository.
4. Under **Environment Variables**, add:
   - GROQ_API_KEY = your Groq API key
5. Click **Deploy**. Your app will be live on a *.vercel.app URL in under a minute!

---

## 📜 License

MIT License. Free for personal and commercial use.

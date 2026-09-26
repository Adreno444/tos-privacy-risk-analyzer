# ToS & Privacy Risk Analyzer

A tool to analyze Terms of Service, Privacy Policies, and EULAs, highlighting key clauses such as mandatory arbitration, data sharing, intellectual property terms, and unilateral changes.

Built with Next.js 15, TypeScript, Tailwind CSS, and the `@google/genai` SDK.

## Features

- **URL & Domain Ingestion**: Enter a domain or link to scrape legal terms directly or discover linked policies.
- **PDF Extraction**: Drag-and-drop or upload PDF agreements for client-side parsing via `unpdf`.
- **Direct Text Input**: Paste raw contract or clause text for instant analysis.
- **Structured Audit**:
  - Risk categorization across 9 areas (arbitration, data sharing, IP rights, auto-renewals, etc.)
  - Verbatim clause quotes and actionable advice
  - Rights balance breakdown
  - Recommended opt-out actions
- **Interactive Q&A**: Ask targeted questions against the analyzed document.
- **Export to PDF**: Native print-to-PDF support with dedicated print styling.
- **Local History**: Scan results saved locally in browser storage.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI / LLM**: `@google/genai` (Google Gen AI SDK)
- **Scraper / Parser**: Cheerio, unpdf
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Adreno444/tos-privacy-risk-analyzer.git
cd tos-privacy-risk-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

The project is configured for deployment on Vercel:

1. Push your repository to GitHub.
2. Import the project in Vercel.
3. Add `GEMINI_API_KEY` under Environment Variables.
4. Deploy.

## License

MIT

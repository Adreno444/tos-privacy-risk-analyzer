# ToS & Privacy Risk Analyzer

An automated legal intelligence and risk auditing platform that parses, aggregates, and evaluates Terms of Service, Privacy Policies, End-User License Agreements (EULAs), and SaaS contracts. The engine ingests legal agreements from raw URLs, domain names, PDF documents, or pasted text, extracts critical clauses, and produces structured risk scores, rights imbalance matrices, and plain-English risk assessments.

---

## Core Capabilities

### Resilient Policy Scraping & Ingestion
- **Domain & Direct URL Resolution**: Accepts direct links to specific policy documents as well as root domains or brand names (e.g. `netflix.com`, `youtube`, `spotify`).
- **Canonical Link Discovery**: Automatically inspects incoming HTML documents to locate and follow embedded sub-links for related legal agreements (e.g. Terms of Use, Privacy Statements, Cookie Policies, Acceptable Use Policies).
- **Fallback Search Indexing**: If a target domain restricts direct crawling, relies on client-rendered SPAs, or fails direct HTTP fetching, the engine falls back to search index retrieval to find and extract the active public policy documents.
- **Client-Side PDF Processing**: Uses WebAssembly-powered PDF text extraction to parse multi-page contracts and EULAs directly in the browser or via API handlers without external dependencies.
- **Direct Text Input**: Accepts pasted clauses and contracts for targeted audit and testing.

### Legal Risk Evaluation & Breakdown
- **Multi-Vector Risk Assessment**: Categorizes terms across 9 key risk categories, including mandatory arbitration, class-action waivers, third-party data broker sharing, AI training permissions, intellectual property licenses, auto-renewal billing terms, unilateral terms changes, and account termination policies.
- **Verbatim Evidence Citations**: Provides exact quotes from the original agreement to substantiate every identified risk flag.
- **Rights Balance Matrix**: Compares user-surrendered rights (such as litigation rights, content ownership, and data tracking consent) against company-retained rights (unilateral modifications, broad indemnification, and service termination).
- **Actionable Steps**: Outlines specific, concrete steps users can take to preserve rights, such as arbitration opt-out notice addresses, deadlines, and privacy settings toggles.

### Interactive Tools & Export
- **Grounded Policy Q&A**: Interactive assistant allowing users to query the ingested legal document in natural language, with responses strictly anchored to the parsed contract text.
- **Print & PDF Export**: Integrated print-specific styling allowing users to save formatted audit reports directly as PDFs via the browser print dialog.
- **Local Scan History**: Stores past scan results locally using `localStorage` for offline review and quick re-auditing.
- **Progress Tracking**: Step-by-step visual indicators tracking document scraping, clause analysis, and score calculation.

---

## Tech Stack

### Frontend & Application Architecture
- **Next.js 15 (App Router)**: Hybrid rendering with React Server Components, server-side route handlers, and static optimization.
- **React 19**: Component lifecycle management, state synchronization, and client-side transitions.
- **TypeScript 5 (Strict Mode)**: Full type safety across legal analysis schemas, API contracts, and scraper pipelines.
- **Tailwind CSS 3**: Utility-first monochrome styling system, custom CSS transitions, and print media stylesheets (`@media print`).
- **Lucide React**: Vector iconography for navigation, risk indicators, and document controls.
- **clsx & tailwind-merge**: Dynamic class composition and conflict resolution.

### Legal Ingestion & Parsing
- **Cheerio 1.0**: High-performance HTML parsing and DOM manipulation for server-side policy extraction and link discovery.
- **unpdf 1.8**: PDF text extraction engine built on standard web technologies, enabling client and edge runtime document processing without native binaries.

### Artificial Intelligence & Processing
- **Google Gen AI SDK (`@google/genai`)**: Integration with Google Gemini models.
- **Structured JSON Schema Constraints**: Uses Gemini `responseSchema` definitions for deterministic type-safe JSON extraction, preventing formatting anomalies and schema drift during clause classification.

### Build & Tooling
- **Node.js**: Runtime environment (v18.18+ / v20+).
- **PostCSS & Autoprefixer**: CSS compilation and cross-browser vendor prefixing.
- **ESLint 9**: Code quality and static analysis.

---

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

3. Configure environment variables:
Create a `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

The application is structured for continuous deployment on platforms like Vercel:

1. Push your repository to GitHub.
2. Import the repository into your deployment platform.
3. Configure `GEMINI_API_KEY` under Environment Variables.
4. Deploy the application.

---

## License

This project is licensed under the [MIT License](LICENSE).

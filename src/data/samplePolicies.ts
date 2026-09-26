export interface SamplePolicy {
  id: string;
  name: string;
  description: string;
  category: string;
  sampleText: string;
}

export const SAMPLE_POLICIES: SamplePolicy[] = [
  {
    id: 'ai-saas',
    name: 'OmniAI Cloud Terms (High Risk Simulation)',
    description: 'Includes AI training on user data, perpetual IP license, and forced arbitration.',
    category: 'AI & SaaS',
    sampleText: `TERMS OF SERVICE AND LICENSE AGREEMENT - OMNIAI INC.

1. ACCEPTANCE OF TERMS
By accessing or using OmniAI ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.

2. USER CONTENT AND AI TRAINING RIGHTS
You retain ownership of the raw data, files, and prompts you upload to the Service. However, by uploading or transmitting any content, you grant OmniAI Inc. a perpetual, irrevocable, worldwide, royalty-free, fully transferable and sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, and distribute your content in any media now known or hereafter developed. Furthermore, you explicitly agree that OmniAI may utilize all uploaded content, conversation logs, and biometric voice recordings to train, fine-tune, and commercialize our proprietary artificial intelligence and machine learning models without compensation to you.

3. UNILATERAL MODIFICATIONS
OmniAI reserves the right to modify, replace, or update these Terms, subscription fees, or service availability at any time in its sole discretion. Your continued use of the Service following any modifications constitutes your binding acceptance of such changes, even if no direct notice was provided to your email address.

4. AUTOMATIC RENEWAL AND CANCELLATION
All subscriptions renew automatically for successive 1-year terms at the then-current non-discounted rate unless cancelled at least 60 days prior to the expiration of the current term through our certified mail cancellation process. All subscription fees are strictly non-refundable under any circumstances.

5. MANDATORY ARBITRATION AND CLASS ACTION WAIVER
YOU AND OMNIAI AGREE THAT ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF OR RELATING TO THESE TERMS SHALL BE RESOLVED SOLELY BY BINDING INDIVIDUAL ARBITRATION CONDUCTED IN DELAWARE UNDER AAA RULES, AND NOT IN A COURT OF LAW. YOU EXPRESSLY WAIVE ANY RIGHT TO PARTICIPATE AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS ACTION, COLLECTIVE ACTION, OR PRIVATE ATTORNEY GENERAL PROCEEDING.

6. LIMITATION OF LIABILITY AND INDEMNIFICATION
TO THE MAXIMUM EXTENT PERMITTED BY LAW, OMNIAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES. YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS OMNIAI INC., ITS OFFICERS, AND EMPLOYEES FROM ANY CLAIMS, DAMAGES, OR LEGAL FEES ARISING FROM YOUR USE OF THE SERVICE OR ANY BREACH OF THESE TERMS.`,
  },
  {
    id: 'social-telemetry',
    name: 'SocialConnect Privacy Policy (Data Brokerage)',
    description: 'Features location tracking, biometric data collection, and 3rd party broker sales.',
    category: 'Social Network',
    sampleText: `PRIVACY POLICY - SOCIALCONNECT PLATFORM

1. INFORMATION WE COLLECT
We collect personal information that you provide to us, including your full name, phone number, government identifiers, contact lists, photos, audio clips, and payment information. In addition, our application continuously collects background GPS coordinates, Bluetooth beacons, Wi-Fi networks in your vicinity, ambient sensor telemetry, battery level, device identifiers, and keystroke timing data.

2. SHARING AND SALE OF PERSONAL DATA
We may share, monetize, license, or sell aggregated, pseudonymized, or identifiable user profile information, including browsing history, location trails, and demographic attributes, to our trusted third-party commercial partners, marketing affiliates, and data brokerage consortiums for targeted behavioral advertising and cross-platform tracking.

3. RETENTION AND DATA DELETION
We retain your personal data for as long as necessary to fulfill business purposes or comply with legal requests. Even if you deactivate or delete your account, backup copies, derived analytical models, and licensed datasets distributed to third parties prior to deletion may persist indefinitely.

4. COOKIES AND CROSS-SITE PIXELS
We place tracking cookies, web beacons, and local storage objects on your device to monitor your activities across third-party websites and applications across the web.`,
  },
  {
    id: 'privacy-first',
    name: 'OpenVault Zero-Knowledge Policy (Consumer Friendly)',
    description: 'Clean, open, consumer-safe policy with no tracking, no arbitration, and local encryption.',
    category: 'Privacy Tool',
    sampleText: `OPENVAULT PRIVACY CHARTER & USER AGREEMENT

1. ZERO-KNOWLEDGE ARCHITECTURE
OpenVault is engineered on client-side zero-knowledge encryption. We do not have access to your encryption keys, passwords, or decrypted files. We cannot view, monetize, sell, or disclose your stored data to anyone.

2. MINIMAL TELEMETRY
We do not collect telemetry, advertising identifiers, device fingerprints, or browsing behavior. The only data we store is your account email and basic subscription status.

3. USER OWNERSHIP
All intellectual property rights in your files, documents, and content remain exclusively yours. OpenVault claims zero license or derivative rights over any uploaded data.

4. TRANSPARENT UPDATES
If we make material changes to this agreement, we will provide at least 30 days prior notice via email and an in-app prompt. If you do not agree with the revisions, you may export your data and close your account at any time without penalty.

5. JURISDICTION & FAIR DISPUTES
Disputes may be settled in standard small-claims court or standard legal venues in your local jurisdiction. We do not enforce mandatory arbitration or class-action bans.`,
  },
];

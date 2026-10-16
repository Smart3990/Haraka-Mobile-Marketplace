# Haraka Mobile Marketplace 🇬🇭

> **Buy and sell items locally in a flash!**  
> A high-performance, mobile-first classifieds and local services marketplace built with React, TypeScript, Tailwind CSS, and structured for native iOS & Android export via Expo Router v4.

---

## 🌟 Overview

**Haraka** is a Ghanaian peer-to-peer marketplace and certified artisan directory designed for fast, trusted local commerce. It bridges buyers, private sellers, commercial storefront merchants, and skilled trade professionals across all 16 regions of Ghana.

The codebase features a dual architecture:
1. **Interactive Web Application & Native Simulator**: Real-time responsive web experience with device framing, frameless mode, dark/clean studio backgrounds, and live split-screen code inspection.
2. **Native Expo Router Structure**: Complete file-based routing architecture (`app/` directory) ready for native deployment with Expo CLI and EAS Build.

---

## ✨ Key Features

### 🛍️ Classifieds & Peer-to-Peer Trading
- **16 Ghana Regions & Geolocation**: Localized discovery covering Greater Accra, Ashanti, Western, Central, Eastern, Volta, Northern, and all 16 administrative regions of Ghana.
- **Dynamic Category & Keyword Matching**: Smart search automatically recognizes intent (e.g., searching "cars" routes to Vehicles, "MacBook" to Laptops & MacBooks).
- **Verified Deals**: Clear badges indicating in-person verified sellers, condition grading (Brand New, Like New, Refurbished, Gently Used), and transparent pricing in Ghana Cedis (GH₵).
- **Voice Notes & Audio Descriptions**: Sellers can record up to 30 seconds of audio descriptions with waveform visualization and playback controls (speed toggle, mute/unmute).
- **Interactive Price Negotiations**: Real-time counter-offers, accept/decline flows, and chat threads with direct cash/MoMo handover advice.

### 🔧 Artisans & Local Services Directory
- **Certified Master Craftsmen**: Carpenters, electricians, plumbers, painters, mechanics, tailors, caterers, and electronics repair specialists.
- **Live Dispatch Availability**: Artisans can toggle between **🟢 Available Now** (for instant emergency callouts) and **🟠 Currently Busy**.
- **Transparent Diagnostic Fees**: Clear inspection fees (e.g., FREE on Arrival or set call-out fees).
- **Direct Service Booking**: Comprehensive booking modal with property type, problem description, voice note recording, work photos, and scheduled date/window.

### 🛡️ Trust & Safety Architecture
- **Ghana Card (NIA) Verification**: Secure identity verification with automated format validation (`GHA-XXXXXXXXX-X`) and privacy-preserving data masking.
- **Physical Inspection Advisory**: Built-in safety warnings advising buyers and sellers to meet in well-lit, busy public locations and avoid advance wire transfers.
- **Listing Flagging & Reporting**: Community-driven reporting system submitted directly to platform moderators.

### 👨‍💼 Multi-Role Support & Admin Dashboard
- **Role Switcher**: Instant switching between **Buyer**, **Seller**, **Artisan**, and **Admin**.
- **Partner & Merchant Onboarding**:
  - Individual Private Sellers (safe meetup hubs, contact permissions).
  - Commercial Storefront Merchants (business certificates, exterior & interior photos, customer guarantees).
  - Skilled Artisans (NVTI/Trade guild certificates, police clearance, coverage areas, audio introduction).
- **Admin Control Dashboard**:
  - Real-time applicant verification queue (Pending, Approved, Rejected).
  - High-resolution document inspector for Ghana Cards and business certificates.
  - Reasoned application rejection flow with customized feedback.
  - Platform demographics and active listing KPIs.

---

## 📁 Project Structure

```plaintext
├── app/                        # Expo Router v4 native application structure
│   ├── (auth)/                 # Authentication stack
│   │   ├── _layout.tsx
│   │   ├── forgot-password.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── welcome.tsx
│   ├── (tabs)/                 # Bottom tab navigator
│   │   ├── _layout.tsx
│   │   ├── categories.tsx
│   │   ├── index.tsx           # Explore / Home feed
│   │   ├── messages.tsx        # Chat & Offer conversations
│   │   ├── post.tsx            # Post Ad / Artisan Dashboard
│   │   ├── profile.tsx         # User Profile & My Ads
│   │   └── saved.tsx           # Bookmarked Favorites
│   ├── book-service/[id].tsx   # Artisan booking screen
│   ├── chat/[id].tsx           # In-app chat conversation
│   ├── listing/[id].tsx        # Listing details & offer negotiation
│   ├── notifications.tsx       # System & safety alerts
│   ├── onboarding.tsx          # 3-step tactile onboarding
│   ├── post-ad/                # Multi-step ad creation flow
│   ├── register-artisan.tsx    # Artisan registration
│   ├── register-partner.tsx    # Partner landing page
│   ├── register-seller.tsx     # 3-step seller registration
│   ├── splash.tsx              # Animated branded splash screen
│   └── _layout.tsx             # Root Stack layout
├── public/                     # Static brand assets and illustrations
├── src/                        # React web application implementation
│   ├── components/             # Reusable UI screens and modals
│   │   ├── DemoAccountsScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── HarakaLogo.tsx
│   │   ├── Icons.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   ├── SignUpScreen.tsx
│   │   ├── SplashScreen.tsx
│   │   └── WelcomeScreen.tsx
│   ├── lib/                    # Data sources & mock services
│   │   ├── artisanProfileData.tsx
│   │   └── listingData.ts
│   ├── App.tsx                 # Main application state machine & simulator
│   ├── index.css               # Global Tailwind CSS styles
│   └── main.tsx                # Web DOM entry point
├── metadata.json               # App manifest configuration
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite configuration with Tailwind CSS plugin
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation
```bash
# Install dependencies
npm install
```

### Running Locally (Web)
```bash
# Start development server on port 3000
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production
```bash
# Compile and optimize for production
npm run build
```

---

## 📱 Native Mobile Deployment (iOS & Android)

The codebase contains full Expo Router file specifications inside the `app/` directory.

### Quick Commands:
```bash
# 1. Start Expo development server
npx expo start

# 2. Run on connected iOS Simulator (macOS required)
npx expo run:ios

# 3. Run on connected Android Emulator or device
npx expo run:android

# 4. Build standalone native binaries via EAS Build
npx eas-cli build --platform all
```

---

## 🎨 Design System & Brand Palette

- **Haraka Orange**: `#FF6A00` / `#EA580C` — Primary CTA, badge highlights, and action buttons.
- **Haraka Forest Green**: `#006C45` / `#1FA971` — Trust, verification, and safety indicators.
- **Slate Dark**: `#131B2E` / `#0F172A` — Typography and dark frame simulation.
- **Backgrounds**: `#FAF8FF` / `#F8FAFC` — Crisp, modern light mode surfaces.
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Weights 400 to 800).

---

## 📄 License

Proprietary © Haraka Marketplace. All rights reserved.

# PadosiPro — Full-Stack Take-Home Assignment

Author: **Ritik Jain**  
Repository: [github.com/ritik2727/PadosiPro-assignment](https://github.com/ritik2727/PadosiPro-assignment)  
Live Backend API: [https://padosipro-assignment.onrender.com](https://padosipro-assignment.onrender.com)  
API Health Check: [https://padosipro-assignment.onrender.com/api/health](https://padosipro-assignment.onrender.com/api/health)  
Architecture & Tradeoffs Document: [DESIGN.md](DESIGN.md)

---

## 📌 Project Overview

This repository contains a full-stack implementation of the PadosiPro onboarding, authentication, profile management, and task request experience modeled after **[app.padosipro.com](https://app.padosipro.com/)**.

The project consists of:
1. **Backend API**: A Node.js and TypeScript REST API using Express, SQLite in WAL mode with foreign keys, Bcrypt password hashing, SHA-256 hashed OTP verification, and JWT session handling.
2. **Mobile Application**: A React Native (Expo) client closely matching the emerald visual design (`#0e4b3e`), typography, iconography, and state transitions of the PadosiPro web application.

---

## ✨ Implemented Requirements

### 1. Authentication & Cryptographic OTP Security
- **Email & Password Registration**: Email normalization, minimum 8-character password with inline confirmation validation.
- **Cryptographic 6-Digit OTP**:
  - Secure random code generation (`crypto.randomInt`).
  - Zero plaintext storage in SQLite — only one-way `SHA-256` digests are stored.
  - Constant-time verification (`crypto.timingSafeEqual`) to mitigate timing attacks.
  - **10-minute expiry (TTL)** and atomic single-use invalidation (`is_used = 1`).
  - **Hard limit of 5 failed attempts** before locking and invalidating the token (`429 Too Many Requests`).
  - **30-second cooldown** between successive OTP generation requests with a live countdown timer.
- **Session Management**: Verified users receive signed JSON Web Tokens (JWT). Unverified logins return `403 Forbidden` (`code: 'UNVERIFIED_EMAIL'`) and automatically route the user to verification.
- **Offline Persistence**: Session tokens and user states persist across cold restarts via `@react-native-async-storage/async-storage`.

### 2. "A few details" Profile Onboarding
- First-time login automatically gates the user to the profile setup screen.
- Form fields:
  - **Full Name** (required)
  - **Mobile Number** (required; validates 10-digit Indian numbers with `+91`)
  - **Address & Area** (required)
  - **Society / Building** (optional)
  - **Flat / Unit** (optional)
  - **Gate Notes** (optional)
  - **Business Name** (optional; see [DESIGN.md](DESIGN.md) for rationale)

### 3. Task Catalogue & Service Requests
- 15 curated task categories with 40+ sub-services seeded from `app.padosipro.com`.
- Real-time search filter (*"AC leaking, cook for weekends..."*).
- Interactive category accordion with multiple sub-service selection pills.
- Urgency selection (*Standard, Same day, Express, Scheduled*).
- Confirmation screen assigning the dedicated Lifestyle Manager (*Pilot LM*).
- Home dashboard displaying active requests and profile details.

### 4. Automated Test Suite
- Comprehensive Jest & Supertest integration tests covering OTP generation, SHA-256 hashing, timing attacks, attempt limits, expiration, cooldowns, and protected endpoints.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express, TypeScript, better-sqlite3 (WAL Mode), Bcrypt, JWT, Zod, Nodemailer |
| **Mobile Client** | React Native, Expo (SDK 54), TypeScript, Expo Vector Icons, AsyncStorage |
| **Testing** | Jest, Supertest, ts-jest |
| **DevOps & Cloud** | Render.com (Cloud API), EAS Build (Android APK), Docker, Docker Compose |

---

## 🚀 Quick Start (Local Setup in < 5 Minutes)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9 or higher

### Option 1: One-Command Startup (Recommended)
From the project root:
```bash
npm run dev
```
This runs both the backend and mobile dev servers concurrently:
- **Backend API**: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)
- **Mobile Server**: `http://localhost:8081` (Press `w` for Web preview, or scan QR code in Expo Go)

---

### Option 2: Running in Separate Terminals

#### Terminal 1 — Backend API
```bash
cd backend
npm install
npm run dev
```

#### Terminal 2 — Mobile Application
```bash
cd mobile
npm install
npm start
```
- Press `w` to open in your web browser.
- Press `a` for Android Emulator.
- Scan the Metro terminal QR code with **Expo Go** on Android or iOS.

---

## 🔑 Pre-Seeded Test Account

For immediate testing without registering a new email:
- **Email**: `demo@padosipro.com`
- **Password**: `Password123!`
- **Profile**: Ritik Jain, `+91 97703 58070`, Vijay Nagar, Andheri East, Mumbai
- *(On the mobile Sign In tab, tap **"⚡ Evaluator 1-Tap Fill"** to auto-fill these credentials)*

---

## 🧪 Running Automated Tests

To run the backend test suite:
```bash
cd backend
npm test
```
All 11 integration and unit tests will run in band against an isolated test database.

---

## 🌐 Live Cloud Deployment & Standalone APK

### Live Backend
- **Base URL**: `https://padosipro-assignment.onrender.com`
- **Health Check**: `https://padosipro-assignment.onrender.com/api/health`
- **Catalogue Endpoint**: `https://padosipro-assignment.onrender.com/api/tasks`

### Standalone Android APK Build
The mobile client is pre-configured with the production cloud API URL in `mobile/eas.json`.

To trigger a cloud build using Expo Application Services:
```bash
cd mobile
npx eas-cli build --platform android --profile preview
```

### Email Delivery on Mobile / APK
- **Ethereal Test Inbox**: When registering with any email, the OTP screen provides an **"Open Ethereal Test Email in Browser"** button to view the received email directly on mobile without needing server logs.
- **Terminal Logging**: The 6-digit OTP is also logged to the server console upon dispatch.
- **Production SMTP**: Standard SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) are supported for direct inbox delivery.

---

## 📁 Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # Express route controllers
│   │   ├── db/              # SQLite connection, schema, and seed data
│   │   ├── middleware/      # JWT auth, error handling, Zod validation
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic (Auth, Profile, Tasks, Email)
│   │   └── utils/           # Cryptographic hashing & logger utilities
│   ├── tests/               # Jest & Supertest integration tests
│   ├── Dockerfile           # Containerized backend deployment
│   └── tsconfig.json
├── mobile/
│   ├── assets/              # App launcher icons, splash, and brand logos
│   ├── src/
│   │   ├── api/             # API client with dynamic host resolution
│   │   ├── components/      # Reusable UI elements (Button, Input, Header, LogoMark)
│   │   ├── context/         # AuthContext & persistent session state
│   │   ├── screens/         # Native screens (Auth, OTP, Profile, Home, Catalogue, Urgency)
│   │   └── theme/           # Color palette (#0e4b3e) and typography tokens
│   ├── app.json             # Expo configuration (package: com.padosipro.assignment)
│   └── eas.json             # EAS Build profile for standalone APK
├── DESIGN.md                # Architectural design document & tradeoff analysis
├── README.md                # Setup & project documentation
└── package.json             # Root workspace with concurrent 1-command startup
```

---

## 📑 Architectural Decisions & Tradeoffs

For detailed documentation covering:
- System Architecture & Threat Modeling
- Why `business_name` is optional
- Architectural tradeoffs (SQLite vs PostgreSQL, React Native Expo vs Bare RN, Nodemailer vs third-party SaaS)
- Roadmap with an additional week (Real-time LM WebSockets, Razorpay UPI, Push Notifications)

Please see **[DESIGN.md](DESIGN.md)**.

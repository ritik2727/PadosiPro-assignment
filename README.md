# PadosiPro Full-Stack Developer Assignment

A production-grade native mobile application and backend service replicating the onboarding, email OTP verification, profile setup, and task selection experience of **[app.padosipro.com](https://app.padosipro.com/)**.

---

## 📱 Features & Highlights

- **Native Mobile Experience**: Built natively with React Native (Expo) mirroring the exact design system, emerald palette (`#0e4b3e`), typography, and user flows from PadosiPro.
- **Email Verification via OTP**:
  - Secure 6-digit one-time code.
  - 10-minute expiry (TTL) with single-use consumption.
  - Strictly limited to 5 wrong attempts before invalidation.
  - 30-second resend cooldown timer with live UI countdown.
  - Zero plain-text storage (persisted as cryptographic SHA-256 hash).
  - Out-of-the-box local testing: Logs OTP directly to console and provides an [Ethereal](https://ethereal.email) web mailbox link.
- **Authentication & Persistence**:
  - Register with inline password confirmation & format validation.
  - Login for verified users issuing signed JWT tokens.
  - Unverified logins cleanly trigger automatic OTP resend and route to verification.
  - Cold restart session persistence using AsyncStorage.
- **"A few details" Profile Onboarding**:
  - Full Name, Indian Mobile Number (`+91` 10 digits), Address & Area, Society / Building, Flat / Unit, and Gate Notes.
  - Business Name (optional, with documented rationale in [DESIGN.md](DESIGN.md)).
- **Task Catalogue & Request Flow**:
  - 15+ curated task categories with 40+ sub-services modeled directly from `app.padosipro.com`.
  - Real-time search query filter (*"AC leaking, cook for weekends..."*).
  - Interactive category accordion with dynamic selection pills.
  - Urgency level selector (*Standard, Same day, Express, Scheduled*).
  - Confirmation screen (*"We're on it"* with assigned Lifestyle Manager *Pilot LM*).
  - Home dashboard tracking active requests and user profile.
- **Defensive Engineering**:
  - Input validation on all endpoints with Zod.
  - Automated tests covering risky logic (OTP gen, SHA-256 hashing, attempt lockouts, expiry, login rules).

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, better-sqlite3 (WAL Mode & Foreign Keys), Bcrypt, JWT, Zod, Nodemailer.
- **Frontend / Mobile**: React Native, Expo SDK, TypeScript, Expo Vector Icons, AsyncStorage.
- **Testing**: Jest, Supertest, ts-jest.
- **DevOps**: Docker, Docker Compose.

---

## 🚀 Quick Start (Under 5 Minutes)

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on v20 & v22)
- **npm**: v9 or higher
- *(Optional)* Docker and Docker Compose (if you prefer containerized execution)

---

### Step 1: Start the Backend API

#### Option A: Direct Local Run (Recommended - Zero Setup)
```bash
cd backend

# Install dependencies (if not already installed)
npm install

# Run database setup & task seeding (automatically seeds 15 categories & 40+ tasks)
npm run seed

# Run the automated tests for security and OTP rules
npm test

# Start the development server
npm run dev
```
> The API will be running at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).
> OTPs will be printed with clear formatting in your terminal console whenever requested.

#### Option B: Docker Compose
From the project root:
```bash
docker compose up --build
```

---

### Step 2: Run the Mobile Application

In a new terminal window:
```bash
cd mobile

# Install dependencies
npm install

# Start the Expo development server
npm start
```

#### How to Preview:
- **Web Browser**: Press `w` in the terminal to launch the native app directly in your browser.
- **Physical Device**: Install the **Expo Go** app on your iOS or Android phone, then scan the QR code shown in the terminal.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator** *(macOS only)*: Press `i` in the terminal.

---

## 📦 Building the Standalone Android APK

You can build a standalone Android APK (`.apk`) using Expo Application Services (EAS):

1. **Install EAS CLI globally**:
   ```bash
   npm install -g eas-cli
   ```
2. **Log in to your Expo account**:
   ```bash
   eas login
   ```
3. **Configure the build profile** (included in `mobile/eas.json`):
   ```bash
   eas build:configure
   ```
4. **Trigger APK build for Android**:
   ```bash
   eas build --platform android --profile preview
   ```
   *EAS will build the APK in the cloud and output a direct download link for the `.apk` file.*

Alternatively, for offline local builds using Android Studio:
```bash
npx expo prebuild
cd android
./gradlew assembleRelease
```
The compiled APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

---

## 🧪 Running Automated Tests

To run the backend test suite verifying OTP cryptographic hashing, expiration, attempt locks, and authentication rules:
```bash
cd backend
npm test
```

---

## 🔒 Environment Variables

The backend includes a pre-configured `.env` and `.env.example`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for the Express server |
| `NODE_ENV` | `development` | Environment mode |
| `JWT_SECRET` | *(secret)* | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `DATABASE_PATH` | `./data/padosipro.sqlite` | SQLite database file path |
| `OTP_EXPIRY_MINUTES` | `10` | OTP validity window in minutes |
| `OTP_MAX_ATTEMPTS` | `5` | Maximum incorrect attempts before lockout |
| `OTP_RESEND_COOLDOWN_SECONDS` | `30` | Minimum wait time before resending OTP |
| `EMAIL_SERVICE` | `ethereal` | Email provider (`ethereal` or `smtp`) |

---

## 📑 Architecture & Design Decisions

For detailed notes on architecture, threat modeling, trade-offs, and future milestones, please refer to **[DESIGN.md](DESIGN.md)**.

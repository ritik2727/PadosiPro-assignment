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

### ⚡ 1-Command Startup (Runs Both Backend & Mobile)
From the project root:
```bash
# Starts both the backend API and the Expo mobile server together
npm run dev
```
- `[BACKEND]` will run on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)
- `[MOBILE]` will run on `http://localhost:8081` (Press `w` for browser, or scan QR code on phone)
- OTP codes will be printed directly in the terminal whenever requested.

---

### 🔑 Pre-Seeded Evaluator Test Account
For instant 1-second testing without creating a new email:
- **Email**: `demo@padosipro.com`
- **Password**: `Password123!`
- *(Status: Verified account pre-loaded with completed profile & active requests)*
- *Tip: On the mobile sign-in screen, simply tap the **"⚡ Evaluator 1-Tap Fill"** button to auto-fill!*

---

### Alternative: Running in Separate Terminals

#### Terminal 1: Backend API
```bash
cd backend
npm run dev
```

#### Terminal 2: Mobile App
```bash
cd mobile
npm start
```

#### How to Preview:
- **Web Browser**: Press `w` in the terminal to launch the native app directly in your browser.
- **Physical Device**: Install the **Expo Go** app on your iOS or Android phone, then scan the QR code shown in the terminal.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator** *(macOS only)*: Press `i` in the terminal.

---

## 📦 Building the Standalone Android APK & Cloud Deployment

When generating a standalone `.apk` for external evaluators, the app must connect to a publicly accessible cloud backend (since evaluators cannot access your local `localhost` or local Wi-Fi).

### Step 1: Deploy Backend to Cloud (Render.com - 100% Free)
1. Push this repository to **GitHub**.
2. Go to **[Render.com](https://render.com/)** and create a **New Web Service**.
3. Connect your GitHub repository and set:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npm run seed`
   - **Start Command**: `npm start`
4. *(Optional Real Email)* In Render's **Environment** tab, set Gmail SMTP variables:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_gmail@gmail.com
   SMTP_PASS=your_16_char_google_app_password
   SMTP_FROM=PadosiPro <your_gmail@gmail.com>
   ```
5. Deploy! Render will give you a public HTTPS URL: e.g. `https://padosipro-api.onrender.com`.

### Step 2: Configure Mobile App for the Cloud Backend
In `mobile/.env`, set:
```env
EXPO_PUBLIC_API_URL=https://padosipro-api.onrender.com
```

### Step 3: Trigger APK Build with EAS
```bash
# 1. Install EAS CLI globally (if not already installed)
npm install -g eas-cli

# 2. Login to your Expo account
eas login

# 3. Trigger cloud build for Android APK
cd mobile
eas build --platform android --profile preview
```
*EAS builds the standalone `.apk` in the cloud and provides a direct download QR code & link.*

### 📱 How External Evaluators Can Test the Standalone APK

1. **Option A (Instant 1-Tap Test Account)**: Evaluators can log in using `demo@padosipro.com` / `Password123!` to test all features instantly with zero OTP wait (simply tap **"⚡ Evaluator 1-Tap Fill"** on the mobile Sign In tab).
2. **Option B (In-App Ethereal Preview Button)**: If real SMTP is not set, we added an **"Open Ethereal Test Email in Browser"** button directly on [VerifyOtpScreen.tsx](mobile/src/screens/VerifyOtpScreen.tsx). The evaluator can tap this button directly on their phone to open the email in Chrome/Safari and view the OTP.
3. **Option C (Real Email Delivery via Gmail SMTP)**: If Gmail SMTP environment variables are configured on the backend, any email the reviewer registers with will receive real 6-digit OTPs directly into their real inbox.

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

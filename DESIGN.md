# PadosiPro Full-Stack Engineering Design Document

## 1. System Architecture & Overview

PadosiPro is a high-touch lifestyle management platform where households delegate tasks and dedicated Lifestyle Managers (LMs) execute them. This system implements the initial customer journey as a native mobile application supported by a robust, secure, and production-ready backend API.

```
┌────────────────────────────────────────────────────────┐
│           React Native (Expo) Mobile Client            │
│  - Native Screens & Dynamic State Management           │
│  - Offline Session Persistence (AsyncStorage)          │
│  - Deep Visual Fidelity to app.padosipro.com           │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT Auth)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Node.js / Express Backend API              │
│  - TypeScript & Clean Layered Architecture             │
│  - Zod Request Schema Validation                       │
│  - Rate Limiting, Brute Force & Security Guards        │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│     SQLite DB (WAL Mode)     │ │   Nodemailer Service  │
│ - Foreign Keys & Indices     │ │ - Real SMTP / Ethereal│
│ - Cryptographic SHA-256 OTPs │ │ - Instant Console Log │
└──────────────────────────────┘ └───────────────────────┘
```

---

## 2. Security Architecture & Threat Modeling

1. **Password Security**:
   - Stored using `bcrypt` with 10 salt rounds.
   - Plaintext passwords are never logged, exposed in error traces, or reversible.

2. **One-Time Password (OTP) Cryptography**:
   - **Generation**: Generated via cryptographically secure pseudo-random integers (`crypto.randomInt(100000, 1000000)`), yielding uniform 6-digit codes.
   - **Zero Plaintext Storage**: Plain OTPs are never stored in the database. Instead, only a one-way `SHA-256` digest is persisted.
   - **Timing Attack Resistance**: Digest comparison uses `crypto.timingSafeEqual` over fixed-width byte buffers.
   - **Strict Attempt Rate-Limiting**: A hard maximum of 5 failed attempts per OTP lifecycle is enforced. On the 5th failed attempt, the OTP is invalidated and locked with `HTTP 429 Too Many Requests`.
   - **Time-to-Live (TTL)**: OTPs expire strictly after 10 minutes. Expired tokens are rejected.
   - **Single-Use Enforcement**: Successfully consumed OTPs are immediately transitioned to `is_used = 1` within an atomic transaction.
   - **Anti-Spam Resend Cooldown**: A 30-second cooldown is enforced between successive generation requests.

3. **Authentication & Session Tokens**:
   - Verified users receive signed JSON Web Tokens (JWT) containing subject claims (`sub`, `email`).
   - Unverified login attempts are blocked with `HTTP 403 Forbidden` (`code: 'UNVERIFIED_EMAIL'`), seamlessly routing clients back to verification.
   - Persistent storage in the mobile app maintains active login state across cold app restarts.

---

## 3. Product & Design Decisions

### Why Business Name is Optional
In our data model, `business_name` is an optional field. 
- **User Demographics**: PadosiPro is positioned primarily as a premium household and family lifestyle management service (e.g. senior care, home maintenance, travel itineraries, errands). Compelling personal users to provide a business name creates high onboarding drop-off.
- **Micro-Enterprises & Consultants**: In major Indian metropolises (Mumbai, Delhi-NCR, Bengaluru), many users run freelance consultancies, creative studios, or home businesses. Making the field optional accommodates business-related lifestyle requests (e.g., GST registration, courier pickups) without alienating residential households.

---

## 4. Key Architectural Trade-Offs

| Decision | Chosen Approach | Alternative Considered | Trade-off Rationale |
|---|---|---|---|
| **Database Engine** | SQLite (WAL mode, Foreign Keys) | PostgreSQL | Zero configuration for local evaluators; runs in under 15 seconds with no external DB container required. Docker Compose provided for containerized parity. |
| **Mobile Architecture** | React Native via Expo | Bare React Native / Flutter | Faster build times, instant local testing across Web, iOS, and Android emulators without platform-specific toolchain friction. |
| **Email Delivery** | Nodemailer with auto Ethereal inbox + Console OTP | SendGrid / AWS SES | Production third-party providers require API keys and domain verification that reviewers do not possess. Ethereal provides web preview URLs and the console prints the code instantly. |

---

## 5. What Was Left Out & Next Steps (With Another Week)

1. **What Was Left Out for This Scope**:
   - Real-time WebSockets / Socket.io for live chat with "Pilot LM". Currently, the LM chat button initiates a dedicated interaction flow.
   - Payment gateway integration (Razorpay / UPI) for bill settlements and task bookings.
   - Full admin portal for Lifestyle Managers to dispatch quotes and view audit logs.

2. **Next Milestones with Another Week**:
   - **In-App LM Chat**: Bidirectional real-time messaging with attachment upload (bills, quotes, photos) using Supabase Realtime or Socket.io.
   - **Push Notifications**: Expo Push Notifications service for task status updates (*"Pilot LM has assigned your plumber"*).
   - **Offline-First Sync**: TanStack React Query with optimistic UI mutations and SQLite local caching on the device.
   - **Multi-Address Support**: Allow users to save multiple residential and office addresses.

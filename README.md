# Campus Echo — Student-Administration Communication Ecosystem

Campus Echo is a premium, secure student-administration communication ecosystem. It gives students an anonymous but verified voice on campus, faculty official responding capabilities, and administration real-time ticket analytics.

---

## 🚀 Technology Stack

*   **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, PWA manifest configurations.
*   **Backend**: NestJS, Socket.io (WebSockets), Passport JWT, local Sentiment NLP engine.
*   **Database & Cache**: PostgreSQL (via Prisma 7 ORM), Redis (caching and socket state).
*   **DevOps & Packaging**: Docker multi-stage builds, GitHub Actions workflows, PowerShell packaging scripts.

---

## 📁 Project Directory Structure

```
campus-echo/
├── package.json                 # Monorepo workspaces definition
├── docker-compose.yml           # Local databases (Postgres, Redis)
├── README.md                    # Root onboarding guide
├── package-production.ps1       # Bundler script (Windows PowerShell)
├── docs/                        # Specifications (Architecture, API, Security)
├── backend/                     # NestJS Backend API
│   ├── src/                     # Auth, Posts, Tickets, Campus modules
│   ├── prisma/                  # Prisma Schema & Seeding scripts
│   └── tsconfig.json
└── frontend/                    # Next.js App Router Client
    ├── src/                     # Client pages, hooks, context, components
    └── public/                  # Manifest and icon assets
```

---

## 🛠️ Getting Started (Local Development)

### 1. Prerequisite Installations
Make sure you have [Node.js v18+](https://nodejs.org/) installed.

### 2. Install Monorepo Dependencies
From the root directory, run:
```bash
npm install
```

### 3. Spin Up Databases
If Docker is installed and running, spin up the local services:
```bash
docker compose up -d
```
*Note: If Docker is unavailable, configure your own PostgreSQL server URL in `backend/.env`.*

### 4. Database Setup & Seeding
Apply migrations and seed the database with mock roles, hierarchy, and users:
```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### 5. Start Development Servers
Run the NestJS backend and Next.js frontend concurrently from the root directory:
```bash
npm run dev
```
*   **Frontend Client**: http://localhost:3000
*   **Backend REST API**: http://localhost:4000

---

## 🧪 Running Unit Tests

To run the NestJS test suites (running mock-based tests fully offline):
```bash
npm run test:backend
```

---

## 📦 Bundling for Production

To pack the entire project (excluding build artifacts and `node_modules`) into a deployable package:
Run the PowerShell packaging script from the root folder:
```powershell
.\package-production.ps1
```
This generates a production zip bundle named **`Campus-Echo-Production.zip`**.

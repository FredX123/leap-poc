# LEAP POC — BFF Pattern with Spring Boot + Angular + Microsoft Entra ID

## Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19 (standalone components, Bootstrap 5) |
| Backend (BFF) | Spring Boot 3.4 + Spring Security 6 (oauth2Login) |
| Identity Provider | Microsoft Entra ID (OIDC + MFA via Security Defaults) |
| Session | Server-side HTTP session → JSESSIONID cookie |
| CSRF | XSRF-TOKEN cookie (Angular reads it) |
| Authorization | Entra App Roles → Spring `ROLE_APP_*` authorities |

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+ / npm 9+
- Angular CLI 19 (`npx @angular/cli@19`)
- A Microsoft Entra ID tenant with:
  - App Registration `poc-bff` (Web, redirect `http://localhost:18080/login/oauth2/code/entra`)
  - Client secret created
  - App Roles: `APP_ADMIN`, `APP_READ`, `APP_WRITE`
  - Roles assigned to test users

## Quick Start

### 1. Set environment variables

```bash
# Windows (PowerShell)
$env:ENTRA_TENANT_ID="<your-tenant-id>"
$env:ENTRA_CLIENT_ID="<your-client-id>"
$env:ENTRA_CLIENT_SECRET="<your-client-secret>"

# Linux/macOS
export ENTRA_TENANT_ID=<your-tenant-id>
export ENTRA_CLIENT_ID=<your-client-id>
export ENTRA_CLIENT_SECRET=<your-client-secret>
```

### 2. Start the backend

```bash
cd leap-poc
mvn spring-boot:run -pl leap-app
```

The backend runs on **http://localhost:18080**.

### 3. Start the Angular dev server

```bash
cd leap-poc/leap-frontend
npm start          # or: npx ng serve
```

The frontend runs on **http://localhost:4200** and proxies `/api/**`, `/oauth2/**`, `/login/**` to port 18080.

### 4. Open in browser

Go to `http://localhost:4200`. Click **Sign in with Microsoft**.

---

## Project Structure

```
leap-poc/
├── pom.xml                    # Maven reactor
├── leap-shared/               # DTOs, role constants
├── leap-user-management/      # GET /api/me
├── leap-budget-report/        # GET /api/budget, PUT /api/budget/{id}
├── leap-app/                  # Spring Boot app + SecurityConfig
└── leap-frontend/             # Angular 19 SPA
    ├── proxy.conf.json
    └── src/app/
        ├── core/              # AuthService, BudgetService, guards, interceptors
        ├── layout/            # HeaderComponent
        ├── pages/             # Welcome, UserManagement, BudgetReport
        └── shared/            # TypeScript models
```

## API Endpoints

| Method | Path | Auth | Role(s) Required |
|--------|------|------|-------------------|
| GET | `/api/me` | Optional | — (returns anon if not logged in) |
| GET | `/api/budget` | Required | `APP_READ` or `APP_WRITE` |
| PUT | `/api/budget/{id}` | Required | `APP_WRITE` |
| POST | `/api/logout` | Required | — |

## Test Users & Expected Behavior

| User | Roles | Sees "User Mgmt" | Sees "Budget Report" | Can Edit Budget |
|------|-------|:-:|:-:|:-:|
| admin@tenant | APP_ADMIN | ✅ | ❌ | ❌ |
| admin-rw@tenant | APP_ADMIN, APP_WRITE | ✅ | ✅ | ✅ |
| reader@tenant | APP_READ | ❌ | ✅ | ❌ |
| writer@tenant | APP_WRITE | ❌ | ✅ | ✅ |
| reader-writer@tenant | APP_READ, APP_WRITE | ❌ | ✅ | ✅ |
| (anonymous) | — | ❌ | ❌ | ❌ |

## Budget Performance Formula

- **Usage %** = (Monthly Expenses ÷ Monthly Budget) × 100
- **Variance** = Monthly Budget − Monthly Expenses (positive = under budget)
- Color coding: ≤75% → green, ≤100% → yellow, >100% → red

## Security Notes

- **No tokens in the browser.** All OAuth tokens are stored server-side in the HTTP session.
- The Angular dev server proxies all backend calls, avoiding CORS issues entirely.
- CSRF is handled via `XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header (Angular convention).
- Backend returns **401** for unauthenticated API calls (not a redirect), so the SPA can handle it gracefully.

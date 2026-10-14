# 🛡️ NerLogix Security Policy & Architecture

## Security Posture Overview
NerLogix employs defense-in-depth security principles engineered for critical infrastructure and defense-adjacent logistics along the Northeast India Trans-Himalayan corridor.

### 1. HTTP Security Headers (OWASP Top 10 Compliance)
- **Helmet Middleware**: Injects strict HTTP response headers:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (HSTS enforced)
  - `X-Content-Type-Options: nosniff` (MIME-type sniffing prevention)
  - `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
  - `Referrer-Policy: no-referrer` (Privacy and leak prevention)
  - `Cross-Origin-Opener-Policy: same-origin` (Spectre/cross-origin isolation)
  - `Cross-Origin-Resource-Policy: same-origin`

### 2. DDoS & Brute-Force Rate Limiting
- **Global API Limiter**: 300 requests/minute per IP window via `express-rate-limit`.
- **Sensitive Operations Limiter**: 60 requests/minute on `/api/auth/*` and `/api/copilot/*` to prevent brute-force password cracking and LLM token exhaustion attacks.

### 3. Payload Flood & Buffer Overflow Defense
- Strict request body size capping (`limit: '10mb'`) prevents payload flooding and heap memory exhaustion attacks.

### 4. Input Sanitization & XSS Mitigation
- All user-supplied field incident notes, driver telemetry, and chat prompts are sanitized against HTML/script tag injection.
- Database queries use parameterized queries (Mongoose) preventing NoSQL injection.

### 5. Role-Based Access Control (RBAC)
- Client and server routes enforce role-level privilege boundaries (`ADMIN`, `DRIVER`, `SIMULATION_OPERATOR`).
- State mutations require signed bearer tokens.

### 6. Vulnerability Disclosure
To report potential security vulnerabilities, contact: `security@nerlogix.in`. All reports are acknowledged within 24 hours.

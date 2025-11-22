# Clearbook – Public Showcase

This folder collects everything that is safe to publish in a public “Clearbook” portfolio repo. It covers the product story, architecture, lessons learned, and a few sanitized snippets so hiring teams can understand the depth of the project without exposing the proprietary codebase.

- `README.md` (this file) → ready for a public repo or Notion/Google Doc.
- `snippets/` → standalone TypeScript samples suitable for linking or embedding elsewhere.

---

## TL;DR

- **Product:** Multi-tenant booking SaaS with admin workspace + embeddable public widget.
- **Stack:** Next.js 14 (App Router), TypeScript, MongoDB/Mongoose, Redis (Upstash), NextAuth, Stripe Connect, SCSS Modules, Cypress, GitHub Actions, Render.
- **Status:** Live demo at [https://clearbook.app](https://clearbook.app) · repo remains private.
- **Role:** Solo founder/engineer — product design, full-stack build, infrastructure, and ops.

---

## Demo & Access

| Resource | Details |
| -------- | ------- |
| Marketing site | https://clearbook.app |
| Demo workspace | Visiting https://clearbook.app/demo provisions a fresh tenant and automatically signs in as `owner@demo.test` (no credentials needed). |
| Widget preview | After a demo launches, the marketing page updates the “View booking widget demo” link to `/embed/<demo-slug>`. The generic `/embed/demo` route exists only for local development. |
| Contact | alle7000.andersson@gmail.com |

---

## Screenshots

**Marketing**

| Hero & CTA | Feature highlights | How it works | Pricing | Demo CTA |
| --- | --- | --- | --- | --- |
| ![Marketing hero](clearbook-showcase/media/commercial-hero.png) | ![Feature grid](clearbook-showcase/media/commercial-features.png) | ![How it works](clearbook-showcase/media/commercial-howitworks.png) | ![Pricing](clearbook-showcase/media/commercial-pricing.png) | ![Launch demo](clearbook-showcase/media/commercial-demo.png) |

**Booking widget**

| Choose service/time | Confirm details |
| --- | --- |
| ![Booking widget service selection](clearbook-showcase/media/booking-widget-1.png) | ![Booking widget confirmation](clearbook-showcase/media/booking-widget-2.png) |

**Dashboard**

| Overview | Availability planner | Bookings |
| --- | --- | --- |
| ![Overview dashboard](clearbook-showcase/media/overview-dashboard.png) | ![Availability planner](clearbook-showcase/media/availability-dashboard.png) | ![Bookings dashboard](clearbook-showcase/media/bookings-dashboard.png) |

| Services | Staff | Staff details |
| --- | --- | --- |
| ![Services dashboard](clearbook-showcase/media/services-dashboard.png) | ![Staff dashboard](clearbook-showcase/media/staff-dashboard.png) | ![Staff profile](clearbook-showcase/media/staff-details-dashboard.png) |

| Settings: Profile | Settings: Booking rules | Settings: Payments | Settings: Notifications |
| --- | --- | --- | --- |
| ![Settings profile](clearbook-showcase/media/settings-1-dashboard.png) | ![Booking rules](clearbook-showcase/media/settings-2-dashboard.png) | ![Payments](clearbook-showcase/media/settings-3-dashboard.png) | ![Notifications](clearbook-showcase/media/settings-4-dashboard.png) |

---

## Problems I Solved

1. **Scheduling chaos:** Businesses needed service- and staff-specific availability, rotating patterns, and a way to draft schedules before publishing.
2. **Concurrency safety:** Public bookings hit the same slot at the same time → I built idempotent APIs with unique compound indexes and Redis tag invalidation.
3. **Payment clarity:** Stripe Connect with fee explanations, automatic application fees, reverse transfers for refunds, and dedicated demo Stripe keys.
4. **Tenant governance:** GDPR-compliant soft deletes, nightly cleanup cron (bookings/staff/demo tenants), and audit logs.
5. **Demo + onboarding:** Sandbox launcher that seeds a tenant, drops a browser cookie, and expires automatically.

---

## Architecture Overview

```
Next.js App Router
├─ Marketing routes (public)
├─ Dashboard (auth-protected)
├─ Public API (bookings, demo, embed)
└─ Internal API (Stripe, admin tooling)

MongoDB (per-tenant collections)
├─ Tenants, Services, Staff, Availability presets
├─ Bookings (soft delete + purge window)
└─ Demo tenants (expiresAt, seeded flag)

Redis (Upstash)
├─ Availability cache per tenant/service/day
└─ Tag-based invalidation on create/update/cancel

Stripe Connect
├─ OAuth onboarding with fee education modal
├─ Checkout sessions + webhooks
└─ Reverse transfers on refund/dispute
```

- **RBAC:** Owner/Admin/Staff roles with NextAuth sessions. Middleware enforces tenant scope on every action.
- **Themable UI:** CSS variables + SCSS modules. Tenants can brand the dashboard and widget without touching code.
- **Edge rate limiting:** Middleware stores per-IP counters in Redis to protect public endpoints.

---

## Selected Highlights

- Draft/publish workflow in the availability planner so schedule tweaks stay isolated until reviewed.
- Service catalog supports per-staff overrides (duration, price, buffers) that flow through analytics and booking validation.
- Booking API enforces `Idempotency-Key` headers, spam-honeypot fields, and concurrency-safe writes with Mongo unique indexes.
- Demo sandbox automatically seeds a tenant, sets browser cookies/localStorage, and expires via nightly cleanup.
- Stripe Connect flows show an educational modal explaining fee math before the account is linked (reduces support tickets).

---

## Testing & Operations

- **Node test runner:** unit + feature coverage (schemas, RBAC helpers, booking math).
- **Integration suites:** spin up Mongo + stripe-mock via Docker to test bookings, availability, Stripe checkout/webhooks, and tenant tooling.
- **Cypress:** end-to-end flows for the widget and dashboard quick actions.
- **GitHub Actions:** lint → typecheck → build → tests on every push; nightly cron runs cleanup scripts.
- **Render deployment:** Node 20 service with `/` health check, log streaming, and alerting on failed deploys/health checks.

---

## Lessons Learned

1. **Caching needs invalidation discipline.** Tag every Redis entry with tenant/service/day so invalidation is deterministic.
2. **Stripe disputes remain costly unless transfers are structured carefully.** Using `application_fee_amount` + `transfer_data` + `reverse_transfer` keeps payouts predictable.
3. **Demo data quickly becomes a liability without cleanup.** Nightly cron jobs plus short-lived cookies keep the sandbox safe.
4. **Docs are part of the product.** GDPR SOPs, fee modal copy, and onboarding explainers saved time in support conversations.

---

## Code Samples

- [`snippets/checkConflicts.ts`](snippets/checkConflicts.ts) – Pure TypeScript overlap detector extracted from the booking engine.
- [`snippets/checkConflicts.test.ts`](snippets/checkConflicts.test.ts) – node:test example showing how I structure fast-running unit tests.
- [`snippets/idempotencyMiddleware.ts`](snippets/idempotencyMiddleware.ts) – Framework-agnostic helper enforcing Idempotency-Key semantics.
- [`snippets/loadTenantTheme.ts`](snippets/loadTenantTheme.ts) – Minimal tenant theme loader that merges DB tokens with defaults.

---

## How to Publish

1. Create a new repository (e.g., `clearbook-showcase`).
2. Copy this `showcase/` folder into it.
3. Add screenshots or GIFs under a `media/` folder and embed them in the README.
4. Include links to the live demo and the case study PDF.
5. Publish the repository and reference it from the portfolio, LinkedIn, and résumé.

That’s enough for recruiters to understand the scope without accessing the proprietary repo.

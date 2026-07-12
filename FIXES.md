# StockFlow Pro — Issue Fix Log

This document tracks each issue, its fix, and before/after state.

---

## Fix Status Legend
- ⏳ Pending
- 🔧 In progress
- ✅ Fixed

---

## Issue #1 — Conflicting tier/plan constants across codebase ✅

**Problem:** Sub-account limits, prices, and feature lists differ between `AuthService`, `signup/page.tsx`, `accounts/page.tsx`, `pricing/page.tsx`, and mobile `subscription.tsx`. No single source of truth.

**Fix approach:** Add canonical `PlanCatalog` in backend + shared constants files in web/mobile; expose `GET /subscription/plans` API.

**Previous state:** Three incompatible limit tables; frontends hardcode different numbers.

**Current state:** `AuthService` now delegates to `PlanCatalog.maxSubAccounts`. `signup/page.tsx` and `accounts/page.tsx` (web) now import `SUB_ACCOUNT_LIMITS`/`MONTHLY_PRICE_USD` from `lib/subscription-plans.ts` instead of hardcoding stale numbers. `subscription.tsx` and `trial-expired.tsx` (mobile) now import from `constants/subscriptionPlans.ts`. `GET /subscription/plans` is now `permitAll` in `SecurityConfig`, and `SubscriptionAccessFilter` is explicitly registered via `addFilterAfter`. `STOCK_RESERVATION` premium gating is enforced in `ReservationController`; the other `PREMIUM_FEATURES` (advanced reports, invoice generation, delivery scheduling) don't yet have a distinct basic/advanced code path to gate without blocking core flows for Standard-tier users — left unenforced pending a product decision on scope.

---

## Issue #2 — Paystack webhook signature bypass ✅

**Problem:** `PaystackWebhookController` only verified the HMAC signature when the `x-paystack-signature` header was present, so omitting the header skipped verification entirely on a `permitAll` endpoint — anyone could POST an arbitrary body and activate a subscription for free.

**Fix:** Reject the request whenever the signature is missing or invalid, and moved the Paystack secret key out of source into `${PAYSTACK_SECRET_KEY}`.

---

## Issue #3 — Hardcoded secrets committed to git ✅

**Problem:** DB password, JWT signing secret, and Paystack secret key were plaintext in `application.properties`; a Gmail app password was plaintext in `frontend-web/app/api/send-email/route.ts`.

**Fix:** All four now read from environment variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`) with no in-repo fallback. **These must be set in Render (backend) and Netlify (frontend-web) before the next deploy, and the leaked values should be rotated.**

---

## Issue #4 — Missing tenant ownership checks (IDOR) ✅

**Problem:** `CreditController` endpoints trusted caller-supplied business IDs with no ownership check; `TierLinkController.accept` and `ReservationController.release` let any authenticated business act on records belonging to a different business.

**Fix:** Added ownership verification in `CreditService`, `TierLinkService.acceptRequest`, and `ReservationService.releaseReservation`, returning 403 via `GlobalExceptionHandler`'s existing "Unauthorized"/"not belong" message matching.

---

## Issue #5 — Sub-account login never resolves admin email ✅

**Problem:** `AuthService.inviteSubAccount` never set `parentUserId`, so sub-account logins could never look up and return the admin's email.

**Fix:** `inviteSubAccount` now resolves the inviting admin via their JWT identity and sets `parentUserId` on the new sub-account.

---

## Issue #6 — Stock reservations never expire ✅

**Problem:** `ReservationService.expireOldReservations()` was fully implemented but never invoked.

**Fix:** Added `@EnableScheduling` + `@Scheduled(fixedRate = 5 min)` so expired reservations are actually marked `EXPIRED`.

---

## Issue #7 — Notification "read" state not persisted ✅

**Problem:** Notifications are client-synthesized (no backend entity), and "read" state lived only in component state — it reset on every reload.

**Fix:** Persisted read notification IDs to `localStorage` (web) / `expo-secure-store` (mobile), keyed by the notification's synthesized ID.

---

## Issue #8 — Web credit page tab was a no-op ✅

**Problem:** `credit/page.tsx` fetched only `/credit/overdue` and ignored the `tab` state entirely — both "They owe me" and "I owe them" tabs showed the same list, and the DTO field names used (`debtorBusinessName`, `.amount`) didn't match the actual `CreditAccountResponse` shape (`partnerBusinessName`, `amountUsd`, `direction`).

**Fix:** Now fetches `/credit/accounts` (both directions) and filters by `direction`; field names corrected to match the DTO. Same field-name fix applied to the notifications pages (web + mobile), which had the same mismatch.

---

## Issue #9 — Dead/orphaned files ✅

**Fix:** Removed `auth/ama.java`, stray `src/Main.java`, and unreachable mobile route duplicates (`app/dispatch.tsx`, `finished-goods.tsx`, `recipes.tsx`, `linked-partners.tsx`, `linked-wholesalers.tsx`, `notification.tsx`, `app/(shared)/*`) — all confirmed unreferenced by any live navigation before deletion.

---

## Issue #10 — Backend base URL duplicated across frontends ✅

**Fix:** Added `frontend-web/lib/api.ts` (mirroring the existing `frontend-mobile/services/api.ts` pattern) and updated all pages/screens that hardcoded the literal URL to import from it instead. Mobile `login.tsx` and `marketplace.tsx` now use the shared `api` axios client instead of raw `fetch` + a duplicated URL.

---

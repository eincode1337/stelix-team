# Stelix Team - API Index

A human-readable index of every `/api/*` endpoint used by the web app. The full
machine-readable contract (request/response schemas, examples) lives in
[`openapi.yaml`](./openapi.yaml).

## Legend

- **Auth** - `session` = requires the session cookie; `public` = works
  unauthenticated; `provider` = server-to-server, signed by an external provider
  (not the browser).

## Notes

- Resource/combo image paths (e.g. `/resource-images/xxx.webp`) are served from
  the CDN base `https://cdn.stelix.team`.

## Conventions

- **`backgroundFetchInit`** - background/polling GETs send the header
  `x-stelix-skip-global-slow-fetch: 1` (suppresses the global slow-fetch loader).
- **HTTP 423 (Locked)** is returned by commerce write endpoints when a matching
  site-feature-lock is active, with body `{ "error": string }`.

---

## auth

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/auth/me` | public | Current user for app bootstrap; returns `{ user: null }` when logged out. |
| GET | `/api/auth/balance` | session | Balance/payable poller (on mount, every 60s, on window focus); `401` → logged out. |
| POST | `/api/auth/logout` | session | Log out; clears user and navigates home (response body ignored). |
| POST | `/api/auth/send-code` | public | Send a login code to an email; error codes `account_blocked` / `smtp_recipient` / `disposable_email` / `send_code_rate_limit`. |
| POST | `/api/auth/dev-login` | public | Local dev switch (no credential check): sets the `mock_session` cookie so the mock API serves the authed sample data → `{ ok: true }`. |
| POST | `/api/profile/email/verify-code` | public | Verify the emailed login/verification code; refreshes the user on success. |
| POST | `/api/security/pin/verify` | session | Verify the 6-char PIN for the full-screen PIN gate; returns `attemptsLeft` / rate-limit info on failure. |

## profile

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/profile` | session | Full profile bundle (superset of `me` + settings-form data); fetched with `/api/chat/settings`. |
| GET | `/api/profile/settings` | session | Read profile settings; client uses `settings.hidePersonalData`. |
| PATCH | `/api/profile/settings` | session | Update settings (`{ hidePersonalData }`); returns `res.ok`. |
| PATCH | `/api/profile/language` | session | Persist the UI language (`{ language, ensureOnly? }`); also writes the language cookie. |
| GET | `/api/profile/oauth/discord` | session | Full-page navigation that starts the Discord OAuth link flow (redirects; returns `?linked=`/`?error=`). |
| POST | `/api/profile/platform-welcome` | session | Legal-consent gate (`{ action: "acceptLegal" }`). |

## commerce

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | session | Get cart items (client splits by `deferred` into active / saved-for-later). |
| POST | `/api/cart` | session | Add to cart (`{ resourceId }` or bulk `{ resourceIds }` → `{ added }`); `423` when locked. |
| PATCH | `/api/cart` | session | Update a line's quantity or move it between active/saved buckets; `423` when locked. |
| DELETE | `/api/cart` | session | Remove one line, or clear active (`{ activeOnly }`) / saved (`{ deferredOnly }`). |
| GET | `/api/cart/summary` | session | Lightweight cart totals for the header badge; `401` when logged out. |
| GET | `/api/orders` | session | List custom orders (`{ orders: [...] }`). |
| POST | `/api/orders` | session | Create a custom order/commission; returns `{ id }` → redirect to `/orders/{id}`; `423` when locked. |
| GET | `/api/resources` | public | Resource catalog (`{ resources, listingKindCounts }`). |
| GET | `/api/resources/{slug}` | public | Single resource detail by slug/id. |
| POST | `/api/resources/catalog-viewed` | public | Map of viewer last-viewed timestamps for the given resource ids (`{ viewed }`). |
| GET | `/api/combos` | public | Combo (bundle) catalog with items, pricing and view counts. |
| POST | `/api/combos/{id}/balance` | session | Buy a combo with site balance (`{ legalAccept, serversByResourceId?, domainsByResourceId? }` → `{ ok, error? }`); `423` when locked. |
| POST | `/api/combos/{id}/checkout-meta` | session | Validate a combo before external payment (`{ error? }`); success → client-side redirect to payment. |
| POST | `/api/combos/{id}/view` | public | Track a unique combo view (`{ uniqueViews }`). |
| GET | `/api/kassa` | public | Checkout payment-method catalog + FX rates (`{ methods, usdRubRate, usdtRubRate, exchangeRates }`). |
| GET | `/api/purchases/{id}` | session | Purchase detail; client reads cover/thumbnail fields (coverPending flow). |
| GET | `/api/payment/deposit-status/{id}` | session | Poll deposit/payment status (`{ status, redirectTo }`); polled every 2s while awaiting a deposit. |
| GET | `/api/withdrawals` | session | Seller withdrawals (payouts); server-rendered page, so this is a gated mock → `{ withdrawals: [] }`; `401` when logged out. |
| POST | `/api/withdrawals` | session | Request a withdrawal (opaque body) → `{ ok: true }`; `401` when logged out. |

## subscriptions

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/subscriptions/memberships` | session | Buyer's active subscriptions + purchasable offerings + `trialUsedOfferingIds`. |
| PATCH | `/api/subscriptions/memberships` | session | Toggle auto-renew (`{ subscriptionId, autoRenew }` → `{ subscription }`). |
| GET | `/api/subscriptions/offerings` | session | Seller offerings; `?exists=1` → `{ exists }`, `?id=` → `{ offering }`, else `{ offerings }`. |
| POST | `/api/subscriptions/offerings` | session | Create/upsert an offering (full Offering object → `{ offering }`). |
| PATCH | `/api/subscriptions/offerings` | session | Set an offering's published state (`{ id, published }` → `{ offering }`). |
| DELETE | `/api/subscriptions/offerings?id={id}` | session | Delete an offering. |
| POST | `/api/subscriptions/subscribe` | session | Subscribe to a seller plan (`{ serviceId, planId, autoRenew }` → `{ subscription }`). |

## notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | session | List notifications (`?unread=1`); returns `{ notifications, total }`; `429` carries `retryAfterSec`. |
| POST | `/api/notifications/read` | session | Mark notifications read (`{ ids }` specific, `{}` all). |
| GET | `/api/site-news` | session | Site-news unread count (`?unreadCount=1` → `{ unreadCount }`); `401` when logged out. List variant. |

## admin

All list tables share the query params `page`, `pageSize` (1..100), `q` (free-text),
and (where applicable) `status` / `role`, and return `{ items, total, page, pageSize }`.
Admin tables share a common response shape (field names, per-table status enums,
and row values). Rows are backed by the bundled sample data or derived from it.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/picker` | session | User-picker autocomplete (`?q`, `?staff=1`, `?sellerTier=1`, `?sellers=1`) → `{ users }`. |
| POST | `/api/users/picker-haystacks` | session | Batch author search "haystacks" + avatars for author filtering (`{ ids }` → `{ blobs, avatars }`). |
| GET | `/api/admin/users` | session | Users table (`status` ∈ ACTIVE/BLOCKED/FROZEN, `role`). |
| GET | `/api/admin/access` | session | Access-management list (users dataset) + `{ viewer: { role } }`. |
| GET | `/api/admin/sellers` | session | Sellers table (aggregated from resource authors; `status` ∈ ACTIVE/FROZEN, `role`). |
| GET | `/api/admin/orders` | session | Orders table (verbatim from orders.json; `status`). |
| GET | `/api/admin/purchases` | session | Purchases table (`status` ∈ PAID/REFUNDED/PENDING/DISPUTED). |
| GET | `/api/admin/resources` | session | Resources table (verbatim; `status`, `role`=author role). |
| GET | `/api/admin/withdrawals` | session | Withdrawals table (`status` ∈ PENDING/PROCESSING/PAID/REJECTED, `role`). |
| GET | `/api/admin/applications` | session | Seller-applications table (`status` ∈ PENDING/APPROVED/REJECTED, `role`). |
| GET | `/api/admin/blacklist` | session | Blacklist table (`q` over identity/site/social/id, `role`). |
| GET | `/api/admin/deliveries` | session | Delivery-log table (`status` = delivery type FILE/DISCORD/LINK/APPLICATION/KEY). |
| GET | `/api/admin/reviews` | session | Reviews-moderation table; single page (`total == items.length`). |
| DELETE | `/api/admin/reviews/{id}` | session | Delete a review → `{ ok, id }`. |
| GET | `/api/admin/stats` | session | Dashboard KPI tiles (`{ sellerCount, userCount, purchaseCount, orderCount, kpis[] }`). |
| GET | `/api/admin/finance` | session | Finance panel: period totals + paginated transactions (`?period=day|week|month|all`). |
| POST | `/api/admin/sessions/{id}/terminate` | session | End a user session (mock no-op) → `{ ok, id }`. |
| POST | `/api/admin/impersonate` | session | Start impersonating a user. |
| DELETE | `/api/admin/impersonate` | session | Stop impersonating; on ok → `/admin/users`. |
| POST | `/api/admin/service-account` | session | Enter service-account mode (optional `{ pin }`); `403` → wrong PIN. |
| DELETE | `/api/admin/service-account` | session | Leave service-account mode; routes by returned `{ role }`. |

## webhooks

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/webhooks/{provider}` | provider | Incoming payment callback. `provider` ∈ yoomoney, yookassa, heleket, freekassa, betatransfer, skinpay, skinsback, robokassa, paypalych, tbank, anypay, tome, platega, cardlink, paymaster, tochka. Body opaque. `404` on unknown provider. |
| GET | `/api/webhooks/{provider}` | provider | GET self-test / redirect ping variant (same provider slugs). `404` on unknown provider. |
| POST | `/api/webhooks/payout/{provider}` | provider | Payout status callback. `provider` ∈ yookassa, heleket, tbank, yoomoney, paypalych, robokassa, anypay, tome, platega (tochka payout uses `/api/webhooks/tochka`). Body opaque. `404` on unknown provider. |
| GET | `/api/webhooks/payout/{provider}` | provider | GET self-test / redirect ping variant (same payout slugs). `404` on unknown provider. |
| GET / POST | `/api/dev/echo-key-webhook` | public | Dev echo endpoint for testing seller webhooks (`{ status, message, key? }`). |

## misc

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/ping` | public | Latency ping; real response is `204 No Content` (round-trip measured client-side). |
| GET | `/api/geo/country` | public | Geo country + default currency (`{ countryCode, isRussia }`); falls back to RUB. |
| GET | `/api/site-feature-locks` | public | Site-wide + per-user feature locks (purchases/payments/withdrawals/orders/etc.). |
| GET | `/api/chat/settings` | session | Chat settings (`{ settings }`, opaque); part of the profile-settings bundle; `401` when logged out. |
| GET | `/api/chat/list` | session | Chat list. |
| GET | `/api/secure-chat-download` | session | Streams a chat attachment/file (binary); URL is a signed token used verbatim. |
| POST | `/api/track/page-view` | public | Analytics beacon (`{ path, referrer }`) on each route change + 3-min heartbeat; fire-and-forget. |
| GET | `/api/discord/user-mentions` | session | Discord user mentions. |
| GET | `/api/presence` | session | Presence. |
| GET | `/api/search` | public | Global search (`?q`). |
| GET | `/api/seller/stats` | public | Platform-wide counters (`{ sellerCount, userCount, purchaseCount, orderCount }`); returns real captured stats with or without a session. |

---

**Totals:** 65 unique paths, 80 operations across 8 tags (matches `openapi.yaml`). Every
`route.ts` under `src/app/api` (56 files, 66 operations) is covered; the remaining paths
are dynamic/server-action routes with no `route.ts` (e.g. `/api/resources/{slug}`,
`/api/combos/{id}/*`, `/api/purchases/{id}`, `/api/payment/deposit-status/{id}`,
`/api/secure-chat-download`, `/api/discord/user-mentions`, `/api/dev/echo-key-webhook`).

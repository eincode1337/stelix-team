# Payment provider webhooks

These are **server-to-server callback endpoints** hit by external payment
providers, **never by the browser**. Each provider POSTs its own signed,
provider-specific payload; the request body is opaque to the client. A handler
acknowledges a valid callback with:

```json
{ "ok": true }
```

Extend a handler with provider-specific signature verification and order
settlement where you need it.

Rather than hand-writing ~30 near-identical files, **two dynamic route handlers
cover every provider**, sharing the generic `webhookAck()` helper in
`src/server/mock.ts`:

- `src/app/api/webhooks/[provider]/route.ts` - every incoming payment webhook
- `src/app/api/webhooks/payout/[provider]/route.ts` - every payout status webhook

Each handler validates the `{provider}` path segment against the provider enum:
a known slug is acknowledged with `200 { "ok": true }`, an unknown slug returns
`404 { "error": "unknown_provider" }`. Slug aliases are normalized before the
lookup (see below).

Each exports `POST` (the normal callback method) and `GET` (some providers use
a GET self-test / redirect ping). Method is ultimately provider-defined.

Because the routes are dynamic, **adding a provider needs no new file** - just
add its slug to the relevant `Set` inside the handler.

## Full provider path registry

Provider slugs (`KASSA_PROVIDER_SLUG`, 16 providers): `yoomoney, yookassa,
heleket, freekassa, betatransfer, skinpay, skinsback, robokassa, paypalych,
tbank, anypay, tome, platega, cardlink, paymaster, tochka`.

Slug aliases normalized before lookup: `t-bank` / `t_bank` → `tbank`,
`any-pay` / `any_pay` → `anypay`.

### Incoming payment webhooks - `/api/webhooks/{provider}`

Handled by `src/app/api/webhooks/[provider]/route.ts` for all 16 providers:

| Provider | Path |
|---|---|
| yookassa | `/api/webhooks/yookassa` |
| heleket | `/api/webhooks/heleket` |
| freekassa | `/api/webhooks/freekassa` |
| yoomoney | `/api/webhooks/yoomoney` |
| betatransfer | `/api/webhooks/betatransfer` |
| skinpay | `/api/webhooks/skinpay` |
| skinsback | `/api/webhooks/skinsback` |
| robokassa | `/api/webhooks/robokassa` |
| paypalych | `/api/webhooks/paypalych` |
| tbank | `/api/webhooks/tbank` |
| anypay | `/api/webhooks/anypay` |
| tome | `/api/webhooks/tome` |
| platega | `/api/webhooks/platega` |
| cardlink | `/api/webhooks/cardlink` |
| paymaster | `/api/webhooks/paymaster` |
| tochka | `/api/webhooks/tochka` (serves both incoming and payout) |

### Payout webhooks - `/api/webhooks/payout/{provider}`

Handled by `src/app/api/webhooks/payout/[provider]/route.ts` for all 9 providers:

| Provider | Path |
|---|---|
| yookassa | `/api/webhooks/payout/yookassa` |
| heleket | `/api/webhooks/payout/heleket` |
| tbank | `/api/webhooks/payout/tbank` |
| yoomoney | `/api/webhooks/payout/yoomoney` |
| paypalych | `/api/webhooks/payout/paypalych` |
| robokassa | `/api/webhooks/payout/robokassa` |
| anypay | `/api/webhooks/payout/anypay` |
| tome | `/api/webhooks/payout/tome` |
| platega | `/api/webhooks/payout/platega` |
| tochka | `/api/webhooks/tochka` (payout maps to the non-`/payout/` path) |

### Dev helper

- `/api/dev/echo-key-webhook` - a development echo endpoint referenced from
  i18n hint text (seller "add resource" webhook feature).

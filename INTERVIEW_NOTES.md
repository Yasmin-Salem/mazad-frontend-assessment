# Interview Notes

## Product and architecture summary

Mazad is one responsive React application rather than separate screenshot implementations. A query-backed presentation provider owns language, direction, and simulated app mode. The shared route tree then renders the same Home, Auction, Add Item, and Login components inside either web or app chrome.

The visual system uses deep green, sage, off-white, warm beige, restrained gold, and red only for urgent/error states. CSS logical properties carry the same component structure between Arabic RTL and English LTR.

## Important decisions

### Absolute auction deadlines

- Why: interval callbacks can be delayed by background tabs and device suspension.
- Choice: calculate remaining time from `endsAt - Date.now()` on every observation and visibility return.
- Rejected alternative: decrementing a stored second counter, which drifts when callbacks are throttled.
- Production change: receive an authoritative server deadline and clock-offset policy while preserving the same calculation.

### Reducer-owned bid validation

- Why: disabled buttons alone cannot protect against stale UI, replayed requests, or direct action dispatch.
- Choice: validate auction identity/status, deadline, increment, monetary consistency, request ID, and short duplicate cooldown in the reducer.
- Rejected alternative: component-only guards.
- Production change: repeat all validation transactionally on an authenticated server; client checks remain UX only.

### Replaceable live-update source

- Why: UI should not know whether an update came from a timer or transport.
- Choice: a minimal subscription interface and deterministic local adapter.
- Rejected alternative: timers scattered through components or premature WebSocket infrastructure.
- Production change: add a reconnecting server adapter with ordering, resynchronization, authentication, and observable connection state.

### Versioned draft boundary

- Why: LocalStorage is external, mutable, fallible input despite TypeScript types.
- Choice: validate a versioned envelope before restoring it and catch access, parse, write, and removal failures.
- Rejected alternative: direct JSON casts inside the form.
- Production change: add schema migrations, server drafts, conflict resolution, and an upload/media service.

### Explicitly local OTP

- Why: a frontend assessment cannot honestly imply SMS delivery or account security.
- Choice: a visible centralized code (`246810`) behind an injectable `OtpService`; success explicitly creates no session.
- Rejected alternative: fake hidden security behavior or storing a pretend token.
- Production change: server-issued expiring challenges, delivery provider, rate limits, abuse controls, authenticated sessions, and audit events.

### Typed native bridge

- Why: React components should depend on capabilities, not Android/iOS/global-object mechanics.
- Choice: `NativeBridge` exposes only `capturePhoto()` and `getLocation()`; `BrowserMockBridge` returns deterministic simulated data.
- Rejected alternative: scattered checks for injected WebView globals or browser permission APIs.
- Production change: platform-specific adapters, request IDs, permission/error taxonomy, payload validation, and native contract versioning.

### One direction-aware Home

- Why: six screenshots describe responsive states, not six products.
- Choice: one semantic component, bilingual copy map, existing auction data, logical styling, and mobile/tablet/desktop CSS compositions.
- Rejected alternative: duplicated Arabic/English or viewport-specific markup.
- Production change: connect featured inventory to a content/API source while retaining the same presentational boundary.

## Mock versus production behavior

| Area | Demonstration behavior | Production requirement |
|---|---|---|
| Auction feed | Deterministic local scheduled updates | Authenticated server stream, ordering, replay, reconnect |
| Bidding | In-memory validated reducer | Server-authoritative atomic transaction and persistence |
| OTP | Visible fixed local code | Expiring server challenge, SMS provider, rate limiting |
| Session | No user session exists | Secure cookie/token lifecycle and authorization |
| Photo | `mock://` metadata | Native/file picker adapter, permissions, upload pipeline |
| Location | Fixed simulated Riyadh coordinate | Permission-aware native/browser provider and privacy policy |
| Listing | Versioned local draft and demo validation | Backend draft/publication, media storage, taxonomy |
| App mode | Browser query changes shared chrome | Real WebView host and versioned bridge adapter |

## Accessibility and responsive strategy

- Semantic headings, fieldsets, labels, error associations, live regions, buttons, links, and navigation landmarks.
- Gallery arrow/Escape keyboard behavior and focus return after zoom.
- Minimum 44px visible Home actions and existing shell touch targets.
- Native numeric input hints for phone, OTP, age, and price; phone/OTP remain LTR inside RTL pages.
- `prefers-reduced-motion` collapses nonessential transitions and animations.
- Natural vertical scrolling is retained; body overflow is never hidden to mask layout issues.

Desktop Chrome emulation does not replace physical device, screen-reader, high zoom, or actual native WebView verification. Those remain explicit release risks.

## Likely reviewer questions

**Why not Redux or a form library?** The auction has one cohesive reducer and the other interactions are local. Additional state/form dependencies would add indirection without solving an observed problem.

**Why not a gallery package?** The required controls, swipe threshold, zoom, keyboard behavior, and fallbacks are small enough to implement and test without bundle-heavy carousel behavior.

**How would WebSocket support fit?** Implement `AuctionUpdateSource`, keep server snapshots authoritative, add sequence/version handling and reconnect resynchronization, and retain the local source as a fallback/demo mode.

**What is the largest current production gap?** There is no backend authority: bids, identity, drafts, and updates remain local demonstrations. Accessibility also needs physical screen-reader/device verification.

**Why serialize Vitest files?** Multiple interaction-heavy jsdom/user-event suites competed for CPU and caused an existing typing sequence to exceed its timeout. Serial files produced deterministic full-suite results without relaxing assertions or application behavior.

## Scope discipline

No real backend, WebSocket, SMS, authentication, media upload, camera/GPS access, native application, payment, admin dashboard, commit, push, or deployment was introduced. Optional work remains gated by explicit approval.

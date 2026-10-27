# Mazad Auction Assessment

A bilingual React and TypeScript auction demonstration with Arabic RTL and English LTR presentation across desktop, tablet, mobile web, and a simulated app/WebView shell.

The project is client-only. Live activity, OTP verification, camera access, and location access are deliberately local mocks—not production services.

## Run locally

Requirements: Node.js `^20.19.0` or `>=22.12.0` and npm. These ranges match the installed Vite version.

```bash
npm ci
npm run dev
```

Vite prints the local URL. Useful direct routes include:

```text
/?lang=en
/auction?lang=en
/listing?lang=en
/login?lang=en
/?mode=app&lang=en
```

Arabic is the default language. `lang=en` selects English, while `mode=app` activates the simulated app/WebView chrome. Navigation preserves these query parameters.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
```

Vitest files run serially to keep the interaction-heavy user-event suites deterministic in constrained environments.

## Implemented experience

- Responsive Home page with Hero, Featured Auction, How It Works, and Add Item CTA sections.
- Live auction room with an absolute-deadline countdown, urgent and expired states, deterministic simulated bidder updates, and price-pulse feedback.
- Quick bids of exactly `+100`, `+500`, and `+1000` SAR, with validation and rapid duplicate protection in the reducer layer.
- Accessible image gallery with buttons, keyboard navigation, RTL-aware swipe gestures, zoom, loading state, and error fallback.
- Add Item form retaining Category, Type, Breed, Age, Opening Price, City, and Description.
- Versioned LocalStorage draft autosave, restoration, corrupted-data handling, unavailable-storage handling, and confirmed clearing.
- Saudi mobile-number validation and local OTP demonstration. The fixed demo code is `246810`.
- Typed `NativeBridge` contract with browser-only photo and Riyadh-location simulations.
- Shared navigation, code-native brand/icons, focus indicators, safe-area spacing, logical RTL CSS, and reduced-motion handling.

## Demo and production boundaries

- Auction updates are deterministic timers in the current browser tab. They are not synchronized across users or backed by WebSocket/server state.
- Bid acceptance is appropriate for a frontend demonstration, not a secure server-authoritative transaction.
- OTP never sends an SMS, authenticates an identity, creates a session, or stores a token.
- `BrowserMockBridge` never opens a camera, requests GPS permission, or communicates with a native application.
- Add Item validates and saves a local draft but never uploads media or publishes an item.
- LocalStorage can be blocked, cleared, or evicted and does not synchronize across devices.
- App mode is browser-rendered WebView-style presentation, not an Android or iOS application.

## Architecture

```text
src/
  app/                 routing and presentation provider
  layouts/             shared web/app shell
  pages/               route entry components
  features/
    auction/           generic model, reducer, hooks, simulator, gallery, room
    listing/           form model, validation, draft service/hook, UI
    auth/              phone/OTP model, demo service, UI
    home/              bilingual responsive presentation
  shared/
    components/        navigation, brand, icons, buttons
    services/          typed native bridge and browser adapter
    i18n/              shared shell copy
```

Auction UI consumes a replaceable `AuctionUpdateSource`; the current implementation is local and no WebSocket is included. Browser persistence and native capabilities also sit behind small adapters so components do not own platform details.

## Verification status

- Automated coverage includes auction timing/reducer/source lifecycle, gallery and bidding interactions, listing validation/storage, OTP/bridge behavior, routing, direction, and Home structure.
- Rendered Chrome checks cover 375, 390, 768, 1024, 1280, and 1440px in Arabic and English, plus relevant app-mode cases.
- The final cross-route audit covers Home, Auction, Add Item, and Login and checks direction, shell presence, route headings, and horizontal overflow.
- Physical-device safe areas, native WebView injection, real mobile keyboards, and a full screen-reader pass remain manual release checks.

Detailed phase evidence, exact command results, responsive measurements, risks, and requirement traceability are maintained in `TASK_CONTEXT.md`. Architecture rationale and interview discussion prompts are in `INTERVIEW_NOTES.md`.

## Deployment and source-control status

The production build is ready for a static Vercel deployment. Vercel should detect the Vite preset, run `npm run build`, and publish `dist`. No environment variables are required for the current client-only demonstration.

The root `vercel.json` rewrites all application paths to `index.html`, allowing direct navigation and refresh on `/auction`, `/listing`, and `/login` while React Router retains control in the browser. After a preview deployment, smoke-test those direct URLs in both languages and with `?mode=app` where relevant.

This workspace has not been initialized as a Git repository, committed, pushed, connected to a remote, or deployed. Those publication steps require explicit approval. No backend or optional WebSocket feature is included.

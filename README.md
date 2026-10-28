# AN'AM Auction Assessment

A bilingual React and TypeScript livestock marketplace and auction demonstration. The original MAZAD assessment requirements remain intact beneath an AN'AM-inspired visual redesign, with Arabic RTL and English LTR presentation across desktop, tablet, mobile web, and a simulated app/WebView shell.

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
/auctions?lang=en
/auction?lang=en
/auction?lang=en&auction=qassim-brown-cow
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

- Responsive AN'AM consumer experience across Home, Auction List, Auction Room, Add Item, and Login, using the approved emerald-green marketplace design language.
- Marketplace Home with livestock hero, integrated search, quick actions, product cards, and shared five-item responsive navigation.
- Filterable Auction List backed by centralized, strongly typed livestock data. Every card opens its own stable auction ID and preserves language/app query parameters.
- Individual Auction Rooms with localized animal content, unique lot numbers, galleries, bid history, status-aware controls, and an explicit featured-Harri fallback for missing or unknown IDs.
- Timestamp-derived live, upcoming, and ended states. Countdown displays are calculated from `startsAt` and `endsAt`, update from the current clock, and never render negative time.
- Live auction behavior includes deterministic simulated bidder updates and price-pulse feedback; upcoming and ended auctions cannot accept bids.
- Quick bids of exactly `+100`, `+500`, and `+1000` SAR, with validation and rapid duplicate protection in the reducer layer.
- Accessible image gallery with buttons, keyboard navigation, RTL-aware swipe gestures, zoom, loading state, and error fallback.
- Add Item form retaining the original Category, Type, Breed, Age, Opening Price, City, Description, validation, and draft requirements.
- Optional client-side selection of up to five JPG, PNG, or WebP product images, including validation, thumbnails, primary-image selection, removal, preview updates, and object-URL cleanup.
- Versioned LocalStorage draft autosave, restoration, corrupted-data handling, unavailable-storage handling, and confirmed clearing.
- Saudi mobile-number validation and a local mock OTP flow. The fixed demo code is `246810`; no SMS is sent.
- Typed `NativeBridge` contract with browser-only mock photo and Riyadh-location behavior for the original assessment integration boundary.
- Shared navigation, code-native brand/icons, focus indicators, safe-area spacing, logical RTL CSS, and reduced-motion handling.

## Demo and production boundaries

- Auction data, status changes, countdowns, and deterministic updates are local to the current browser session. They are not synchronized across users or backed by WebSocket/server state.
- Bid acceptance is appropriate for a frontend demonstration, not a secure server-authoritative transaction.
- OTP never sends an SMS, authenticates an identity, creates a session, or stores a token.
- `BrowserMockBridge` never opens a camera, requests GPS permission, or communicates with a native application.
- Add Item validates and saves text fields to a local draft but never uploads media or publishes an item. Selected images use temporary object URLs, remain session-only, and are intentionally excluded from LocalStorage.
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

- Automated coverage includes auction timing/status transitions, per-auction routing and content, reducer/source lifecycle, gallery and bidding interactions, Messages toast timing, image-selection lifecycle, listing validation/storage, OTP/bridge behavior, routing, direction, and Home structure.
- Rendered Chrome checks cover 375, 390, 768, 1024, 1280, and 1440px in Arabic and English, plus relevant app-mode cases.
- The final cross-route audit covers Home, Auction, Add Item, and Login and checks direction, shell presence, route headings, and horizontal overflow.
- Physical-device safe areas, native WebView injection, real mobile keyboards, and a full screen-reader pass remain manual release checks.

Detailed phase evidence, exact command results, responsive measurements, risks, and requirement traceability are maintained in `TASK_CONTEXT.md`. Architecture rationale and interview discussion prompts are in `INTERVIEW_NOTES.md`.

## Deployment and source-control status

The project is designed for static Vite hosting. A host such as Vercel can run `npm run build` and publish `dist`; no environment variables are required for this local-only demonstration.

The root `vercel.json` rewrites all application paths to `index.html`, allowing direct navigation and refresh on `/auction`, `/listing`, and `/login` while React Router retains control in the browser. After a preview deployment, smoke-test those direct URLs in both languages and with `?mode=app` where relevant.

No backend, database, payment service, real authentication, production media storage, or WebSocket service is included. Commit, push, merge, and deployment remain separate explicitly authorized delivery steps.

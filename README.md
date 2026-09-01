# Copahome — AI Curtain Visualizer

A production-oriented MVP that lets a customer upload a photo of their room and see it
with transparent, semi-transparent, or blackout curtains — using the customer's real
photo as the source of truth, edited as minimally as possible.

## 1. Architecture

```
PHOTO UPLOAD (client, resized to ≤1600px in-browser)
        │
        ▼
IMAGE ANALYSIS  ──►  POST /api/analyze  ──►  AIProvider.analyzeRoom()
        │                                    (vision model, structured JSON output:
        │                                     window bounding boxes, floor line,
        │                                     occlusion, room/lighting/perspective notes)
        ▼
WINDOW DETECTION / "MASK" (the RoomAnalysis JSON above — see §4 for why this
        │                   replaces a literal pixel mask in the MVP)
        ▼
CURTAIN TYPE SELECTION (client: transparent / semi-transparent / blackout)
        │
        ▼
AI IMAGE EDITING   ──►  POST /api/generate  ──►  AIProvider.generateVisualization()
        │                                        (image-edit model, prompted with the
        │                                         RoomAnalysis + curtain fabric physics)
        ▼
RESULT (before/after slider, per curtain type, cached client-side so switching
        tabs between already-generated types is instant)
```

The original photo is never mutated: the client holds the original `dataUrl` and each
generated result separately, so "Origineel" always shows the untouched upload.

**No server-side image storage in the MVP.** Images flow through as base64 in the
request body for the lifetime of that single request only — nothing is written to
disk or a database. This satisfies the brief's privacy requirement (§18) by
construction rather than by a retention policy that has to be trusted. It also means
there is currently no history/gallery of past visualizations; see §7 (Roadmap) for
how to add persistent, opt-in storage later without changing the pipeline.

### Folder structure

```
src/
  app/
    page.tsx                 # Landing + Visualizer composition
    layout.tsx                # Fonts (Geist Sans / Fraunces), metadata
    globals.css                # Design tokens (color, no dark mode — see §5)
    api/
      analyze/route.ts        # POST: photo -> RoomAnalysis
      generate/route.ts       # POST: photo + RoomAnalysis + curtainType -> image
  components/                 # Presentational + the Visualizer state machine
    Visualizer.tsx             # Orchestrates upload -> analyze -> select -> generate
    UploadDropzone.tsx
    CurtainTypeSelector.tsx / CurtainTypeCard.tsx
    BeforeAfterSlider.tsx
    ResultTabs.tsx
    LoadingState.tsx / ErrorState.tsx
    Header.tsx / CTASection.tsx / PrivacyNotice.tsx
  lib/
    ai/
      types.ts                 # AIProvider interface, RoomAnalysis, etc.
      provider.ts               # getAIProvider() factory (reads AI_PROVIDER env var)
      prompts.ts                 # Analysis + edit prompt builders
      providers/
        gemini.ts                 # Default provider
        openai.ts                  # Alternate provider
        mock.ts                     # No-network provider (see §3)
    curtains.ts                 # The 3 curtain types as Product records + fabric physics
    validation.ts                 # File type/size + curtainType validation
    rateLimit.ts                   # In-memory per-IP rate limiting
    analytics.ts                    # Structured event logging (§6)
    image-client.ts                  # Client-side downscale/re-encode before upload
  types/
    product.ts                  # Product data model (§7 — built for Phase 2 from day 1)
    visualizer.ts                 # Client-only UI state types
```

## 2. Core principle, enforced in the prompt layer

> "Edit the customer's existing photograph as minimally as possible while
> realistically adding the selected curtain treatment."

This is implemented in `src/lib/ai/prompts.ts::buildEditPrompt`, which:
- Embeds the room description, lighting, and perspective notes from the analysis step
  so the edit model has context instead of guessing.
- Lists every detected window with its normalized bounding box, whether it already has
  curtains (replace vs. add), what furniture occludes it (must stay in front of the new
  curtain), and where the floor line is (curtain drop length).
- Describes the chosen curtain type's **physical fabric properties** (light
  transmission, weight, fold structure — see `src/lib/curtains.ts`), not just a color,
  so blackout is a genuinely different material rendering, not a darker semi-transparent
  curtain (brief §6).
- Explicitly instructs the model to preserve everything else pixel-for-pixel where
  possible: furniture, floor, walls, ceiling, people/pets, camera angle.

## 3. AI provider choice

The brief asked for a comparison before committing. Evaluated for this specific job —
edit an existing photo, touching only the curtain/window zone, at production cost and
speed:

| | **Gemini 2.5 Flash Image** (chosen default) | OpenAI `gpt-image-1` edits | Dedicated inpainting (FLUX.1 Fill + SAM mask) |
|---|---|---|---|
| Model type | Instruction-following image **edit** model | Image edit model (mask optional) | Diffusion inpainting, requires a pixel mask |
| Scene preservation | Strong — edits described regions, tends to leave the rest of the frame alone | Weaker without an explicit mask — tends to re-render more of the frame | Strongest, but only as good as the mask feeding it |
| Structured vision output | Yes, native JSON schema mode — used for the analysis step | Only via a separate vision call, JSON-mode prompting (less reliable schema adherence) | None built in — needs a separate detector |
| Engineering complexity for MVP | Low — one API, image-in/image-out, no mask pipeline | Low, same shape as Gemini | High — needs a segmentation model (e.g. SAM) hosted separately, plus mask compositing |
| Latency | Seconds, single call per generation | Seconds, single call | Multiple calls/services (detect → segment → inpaint) |
| Commercial usage rights | Yes | Yes | Yes (model-dependent license) |
| Cost per generation | Low–moderate | Moderate–higher for `gpt-image-1` | Variable, pay for GPU hosting + orchestration |

**Decision: Gemini 2.5 Flash Image is the default (`AI_PROVIDER=gemini`)**, because it
gets the brief's hardest requirement — "don't repaint the room, only the curtain" —
mostly for free from the model's own behavior, without building and hosting a
segmentation/inpainting pipeline for an MVP. OpenAI is implemented as a fully working
second provider (`AI_PROVIDER=openai`) to prove the abstraction is real and to give a
fallback if Gemini access is unavailable — but expect it to preserve the room less
faithfully since its edit endpoint isn't given a pixel mask here.

**What "masking" means in this MVP** (brief §14): there is no hand-built pixel mask.
Instead, `analyzeRoom()` asks the vision model for structured window regions
(bounding box, occlusion, floor line) and that structured data is compiled into the
edit instruction — a *semantic* mask expressed in the prompt rather than a literal one
in pixels. This is the pragmatic MVP tradeoff called out in the brief's cost/complexity
sections; §7 below names the concrete upgrade path (SAM + FLUX Fill) if stricter pixel-
level control is ever needed, e.g. for very cluttered rooms where prompt-only
occlusion instructions aren't reliable enough.

**Provider-agnostic by construction:** every provider implements the same
`AIProvider` interface (`src/lib/ai/types.ts`). Switching is one env var
(`AI_PROVIDER`); adding a new provider means adding one file under
`src/lib/ai/providers/` and one `case` in `src/lib/ai/provider.ts`.

**No API key configured?** The app falls back to `MockProvider` automatically (logged
as a warning) so it always boots — useful for local frontend work, demos, and CI
without needing a paid key. The mock returns the original photo with an on-screen note
explaining it's demo mode; it never fabricates a fake edit.

## 4. Risks & known limitations (MVP)

- **Prompt-only occlusion is not pixel-perfect.** For simple rooms (visible window,
  ordinary furniture) the edit model respects "keep the sofa in front of the curtain"
  instructions well. For very cluttered or ambiguous scenes, results can be
  inconsistent — the named upgrade path is a real segmentation mask (§7).
  - **Model output is inherently non-deterministic.** Two generations of the same
  photo/curtain type won't be pixel-identical. This is expected for MVP; a "regenerate"
  affordance is a natural fast-follow if quality varies more than desired.
- **In-memory rate limiting only scales to one server instance** (`src/lib/rateLimit.ts`).
  Fine for MVP/single-region deployment; swap for Upstash/Redis before scaling out.
- **No persistence** means no session history, no analytics beyond structured logs, and
  no ability to email a customer their result later — all deliberate MVP scope cuts, not
  oversights (see Roadmap).

## 5. Design decisions

- **Fraunces** (display serif) for headings + **Geist Sans** for UI — an editorial,
  architecture-studio feel rather than a generic SaaS/AI look, per the brief's explicit
  "premium, Belgian, architectural, minimalistic" direction (§9/§24).
- **Light-only theme.** Copahome is a premium consumer brand; a single considered light
  palette (warm off-white background, near-black text, a restrained terracotta accent)
  reads as more deliberate than an auto dark mode for this kind of sales tool.
- **Curtain type cards use rendered light-transmission swatches**, not stock photography
  (none was available) — a small gradient + fold-line overlay per type, tuned so the
  three options are visually distinguishable at a glance (brief §3's "the user must
  immediately understand the difference").
- **Loading copy rotates through fixed messages, no fake percentage** — the brief is
  explicit that we don't have real progress data from the provider call, so a progress
  bar would be lying (§19).

## 6. Analytics & security posture

- `src/lib/analytics.ts` defines the event shape the brief's analytics section asks for
  (uploads, analyses, generations by curtain type, CTA clicks) and logs them as
  structured JSON server-side. No image bytes or PII are ever included. Swap the sink
  for a real analytics platform without touching call sites.
- **Validation** (`src/lib/validation.ts`): MIME type allowlist (JPEG/PNG/WebP), a byte-
  size ceiling on the decoded payload, and a curtain-type allowlist — enforced on every
  API route before any provider call.
- **Rate limiting** (`src/lib/rateLimit.ts`): per-IP, per-route, in-memory fixed window
  (30 analyses / 20 generations per 10 minutes by default) — the concrete cost-control
  measure for a flow that can trigger multiple paid AI calls per visitor (brief §29).
- **No API keys reach the client.** All provider calls happen inside API routes; the
  browser only ever sees the resulting image.
- Client-side image downscaling (`src/lib/image-client.ts`) both speeds up mobile
  uploads and reduces per-generation provider cost.

## 7. Roadmap (Phase 2, architected for but not built)

The `Product` model (`src/types/product.ts`) already has `collection`, `fabric`,
`color`, `texture`, `pattern`, `metadata` — the three MVP curtain "types" are just
three seeded `Product` rows (`src/lib/curtains.ts`). Phase 2 is additive:

1. Replace the 3 static cards with a real collection browser (fabric → color →
   structure), each still resolving to a `Product` that flows into the existing
   `generateVisualization({ product, ... })` parameter — already wired, currently only
   used to override the default fabric name/color in the prompt.
2. Swap the semantic-mask approach for a true pixel mask (segmentation model, e.g. SAM,
   feeding a dedicated inpainting model) if cluttered-room occlusion accuracy needs to
   improve beyond what prompting achieves.
3. Add "Bekijk deze stof" / "Prijs aanvragen" / "Vraag staal aan" CTAs once specific
   SKUs are selectable, per the brief's sales-tool end state (§23).
4. Swap `MockProvider`'s in-memory rate limiter for Redis/Upstash when running more
   than one instance.
5. Optional persistence layer (short-lived signed URLs, auto-expiring storage) if a
   "email me this visualization" feature is wanted — the pipeline already separates
   original/generated/metadata cleanly enough to add this without a rewrite.

## 8. Setup

```bash
npm install
cp .env.example .env.local
# Fill in GEMINI_API_KEY (recommended) or OPENAI_API_KEY, or leave both empty
# to run against the mock provider.
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `AI_PROVIDER` | No | `gemini` | `gemini` \| `openai` \| `mock` |
| `GEMINI_API_KEY` | If using Gemini | — | https://aistudio.google.com/apikey |
| `GEMINI_ANALYSIS_MODEL` | No | `gemini-2.5-flash` | |
| `GEMINI_IMAGE_MODEL` | No | `gemini-2.5-flash-image` | |
| `OPENAI_API_KEY` | If using OpenAI | — | https://platform.openai.com/api-keys |
| `OPENAI_ANALYSIS_MODEL` | No | `gpt-4o` | |
| `OPENAI_IMAGE_MODEL` | No | `gpt-image-1` | |

No key configured for the selected provider → the app logs a warning and serves the
mock provider instead, so `npm run dev` always works out of the box.

### Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
```

### Troubleshooting: Gemini model 404s

Google renames/deprecates Gemini model IDs faster than any hardcoded default can keep
up. If `/api/analyze` or `/api/generate` fails and the server logs (Vercel: Project →
Logs, or `vercel logs`) show something like:

```
Gemini API error (404) for model gemini-2.5-flash: ... "no longer available ..."
```

the fix is a config change, not a code change:

1. List the models your key currently has access to:
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_GEMINI_API_KEY"
   ```
2. Find the current text/vision model (for `GEMINI_ANALYSIS_MODEL`) and the current
   image-generation/edit model (for `GEMINI_IMAGE_MODEL`) — look for one whose
   `supportedGenerationMethods` includes `generateContent`, and for the image model,
   one described as image-output capable.
3. Set `GEMINI_ANALYSIS_MODEL` and/or `GEMINI_IMAGE_MODEL` in your deployment's
   environment variables (Vercel: Settings → Environment Variables) to the exact model
   name from step 2, then redeploy.

The demo-mode amber banner (shown when `AI_PROVIDER` silently fell back to the mock
provider because the configured provider failed to *initialize*, e.g. no key at all)
is a different signal from this 404 — a 404 means the key works but the model name is
stale, so the request fails outright rather than falling back to the mock provider.

## 9. MVP checklist (brief §21)

- [x] Photo upload (drag & drop, click-to-browse, mobile camera capture)
- [x] Room analysis + window detection (structured JSON, provider-agnostic)
- [x] Curtain zone / semantic mask derivation
- [x] Transparent / semi-transparent / blackout generation, each with distinct fabric
      physics in the prompt
- [x] Before/after slider
- [x] Loading state with rotating status copy (no fake progress)
- [x] Error handling with the exact Dutch copy and tips specified in the brief (§20)
- [x] Download result; share via the Web Share API where supported
- [x] Responsive, mobile-first layout

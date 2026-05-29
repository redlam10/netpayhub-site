# CLAUDE.md — NetPayHub project rules

You are working on **NetPayHub**, a privacy-first website of localized salary & tax
calculators (starting with Ireland, 2026). Read and follow these rules on EVERY task.
When in doubt, match the patterns already present in the existing files.

---

## 1. SECURITY & PRIVACY — non-negotiable (this is the brand's #1 promise)

- **All calculations run client-side**, in plain JavaScript in the browser. NEVER send
  user inputs (salary, income, etc.) to any server or external service.
- **No outbound network calls of any kind** from the calculator logic. The pages set a
  Content-Security-Policy with `connect-src 'none'`. Do not add `fetch`, `XMLHttpRequest`,
  websockets, beacons, or form submissions that send data out. Keep `form-action 'none'`.
- **No third-party scripts** on calculator pages (no analytics, no ad scripts that read
  inputs, no trackers, no tag managers).
- **No storage of user inputs**: no cookies, no `localStorage`/`sessionStorage` of salary
  figures, no accounts, no database. Refreshing the page must clear everything.
- **PDF / reports must be generated locally** using the browser's native `window.print()`
  + a print stylesheet. NEVER add an external PDF library from a CDN. Self-contained only.
- Keep the security headers in `_headers` (HSTS, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, Permissions-Policy, CSP).
- The CSP currently allows `script-src 'self' 'unsafe-inline'` because JS is inline.
  If you externalize JS into files, switch `script-src` back to `'self'` (drop unsafe-inline).
- Prefer self-hosted fonts over Google Fonts when practical (zero external requests).

## 2. TECH & DEPLOYMENT

- **Static site only**: plain HTML/CSS/JS. No framework, no build step (build command `exit 0`).
- Hosted on **Cloudflare** (Workers static assets / Pages). Files live at the **repo root**.
  `wrangler.jsonc` sets `assets.directory: "."`.
- **Pretty URLs** via folders + `index.html`
  (e.g. `/ireland/net-salary-calculator-2026/index.html`).
- `robots.txt`, `sitemap.xml`, `_headers`, `wrangler.jsonc` stay at the **root**.
- `sitemap.xml` must list **only pages that actually exist** (no 404s).
- `robots.txt` must keep allowing AI crawlers (GPTBot, PerplexityBot, ClaudeBot,
  Google-Extended, etc.) so the tools can be cited.

## 3. INTERNAL LINKING — strict rule

- **NEVER link to a page that does not exist.** Every internal link must resolve to a real
  file. If you reference a future page, build it in the same change or don't link it yet.
- Build topical authority: hubs (`/ireland/`), sub-hubs (`/ireland/freelancers/`,
  `/ireland/contractors/`, etc.), and tool pages, cross-linked sensibly.

## 4. SEO / GEO / AEO — apply to every page

- **Quick Answer box directly under the H1**: one short, factual, citation-ready sentence.
- **Structured data (JSON-LD)** on every page: `WebApplication` (for tools), `FAQPage`,
  `BreadcrumbList`, and `Organization` where relevant. Keep it accurate (no fake ratings).
- **Entity SEO**: naturally mention and connect Revenue.ie, PAYE, USC, PRSI, Budget 2026,
  Irish tax bands, take-home pay, self-employed tax.
- **AEO**: use question-based H2/H3 headings, concise answers first, then detail; tables/lists.
- **Search intent**: target transactional + localized + utility queries
  (pattern `[tool] + [country] + [profession/year]`), not broad informational terms.
- Set per-page `<title>`, meta description, and `<link rel="canonical">` to the real
  `https://netpayhub.com/...` URL.

## 5. E-E-A-T & CONTENT ACCURACY

- **Never invent tax figures.** Use the official 2026 values from Revenue.ie / Budget 2026.
  Current values used: PAYE 20% up to €44,000 single (€53,000 married one income), 40% above;
  tax credits Personal €2,000 + Employee PAYE €2,000; USC 0.5% / 2% (to €28,700) / 3% / 8%;
  PRSI 4.2% (rising to 4.35% from 1 Oct 2026). Verify against revenue.ie if unsure.
- Every calculator page includes: a methodology section, official source link (revenue.ie),
  a "last updated" date, an editorial/author note, and a clear "estimate, not tax advice"
  disclaimer.

## 6. DESIGN SYSTEM (keep consistent across pages)

- Fonts: **Bricolage Grotesque** (headings) + **Hanken Grotesk** (body). Avoid generic
  fonts (Inter, Roboto, Arial).
- Use the existing CSS variables / color tokens (warm paper bg, deep emerald brand `#0E5C43`,
  amber accent `#F2A900`, blue lock accent for privacy). Support **dark mode**
  (`prefers-color-scheme`). Mobile-first.
- Page structure order: H1 → Quick Answer box → interactive tool (above the fold) →
  Save-as-PDF button → explanation/methodology → FAQ → related (existing) links → source/EEAT.

## 7. PROGRAMMATIC SEO

- Scale via one template + a data set (country × profession × year). Every generated page
  must have **unique, genuinely useful content** (localized examples, real rules, custom FAQ,
  custom answer line). **No thin or duplicate pages** — Google penalizes them.

## 8. MONETIZATION (later phases — respect privacy)

- Planned: AdSense → then a premium ad network, plus affiliate (Wise, Revolut, Deel,
  Payoneer, accounting/payroll SaaS), and later API / embeddable widgets / premium PDF.
- **Reconciliation rule**: do NOT place ad/tracking scripts that can read user inputs on the
  calculator pages. Keep the calculator itself clean; if ads are added, isolate them and add
  proper consent (GDPR/EU). Privacy positioning takes priority over ad revenue.

## 9. WORKFLOW

- Make focused changes, keep pages self-contained, then the user commits & pushes
  (Cloudflare auto-deploys). After edits, double-check: no broken internal links, calculators
  still compute, schema still valid, `_headers` intact.

## 10. PER-PAGE SEO CHECKLIST (apply to EVERY page; new pages must comply automatically)

- **One distinct focus keyword per page** — never reuse a focus keyword across pages.
- **`<title>` ≤ 60 chars**, focus keyword FIRST, include "Ireland" (+ year only if relevant).
  Unique per page.
- **Meta description 140–160 chars**, includes the focus keyword, written to earn clicks. Unique.
- **`<html lang="en">`**, descriptive folder slug, and `<link rel="canonical">` to the real
  `https://netpayhub.com/...` URL.
- **Exactly one `<h1>`** containing the focus keyword; the focus keyword also appears in **≥1
  H2/H3**; keep a clean H1 → H2 → H3 order.
- **Quick Answer box** directly under the H1: 1–2 citation-ready sentences containing a real number
  (a worked example for tools).
- **Open Graph + Twitter Card** meta: title, description, type, url.
- **JSON-LD**: `WebApplication` (tools) + `FAQPage` + `BreadcrumbList`; `Organization` sitewide.
- **Internal links to EXISTING pages only**, with descriptive keyword-rich anchors (never
  "click here"). Cross-link related tools and the relevant hub/sub-hub.
- **At least one image or inline SVG** with a descriptive `alt`/`aria-label` containing the focus
  keyword (CSP-safe: inline SVG or self-hosted only).
- **Natural semantic keywords** in the body where relevant (take-home pay, PAYE, USC, PRSI, gross
  to net, tax credits); density ~0.8–2%, never stuff. (Pure-math tools state "no tax data used".)
- **"Last updated" date + EEAT author block + source link** (revenue.ie for tax tools; for
  pure-math tools link `/methodology/` and state that no tax data is used).
- **Mobile-friendly**: short paragraphs (2–4 lines), bullet lists, scannable layout.
- **Focus-keyword map** (the single target keyword per page — do not reuse):
  - `/` → "Ireland salary calculator"
  - `/ireland/` → "Ireland salary and tax calculators"
  - `/ireland/net-salary-calculator-2026/` → "net salary calculator Ireland"
  - `/ireland/day-rate-to-salary-calculator/` → "day rate to salary calculator Ireland"
  - `/ireland/hourly-to-annual-salary-calculator/` → "hourly to annual salary Ireland"
  - `/ireland/annual-salary-to-hourly-calculator/` → "salary to hourly calculator Ireland"
  - `/ireland/freelance-hourly-rate-calculator/` → "freelance hourly rate calculator Ireland"
  - `/ireland/pro-rata-salary-calculator/` → "pro rata salary calculator Ireland"
  - `/ireland/overtime-pay-calculator/` → "overtime pay calculator Ireland"
  - `/ireland/freelancers/` → "freelancer calculators Ireland"
  - `/ireland/contractors/` → "contractor calculators Ireland"
  - about, methodology, editorial-policy, privacy, terms, disclaimer: optimize titles/meta/
    headings only; keep indexable but low sitemap priority — NOT keyword targets.

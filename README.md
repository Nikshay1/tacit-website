# Tacit website

A complete, responsive marketing website for Tacit. Eleven static pages share a common navigation, visual system, and footer. The design follows the supplied Jedify reference: full-screen video, inset translucent navigation, Space Grotesk / Inter typography, image tabs, a product story, a dark learning-layer section, and a dotted closing CTA.

## Develop

Requires Node.js 20+ and Python 3 for the optional local server. There are no npm dependencies.

```sh
npm run build
npm run check
npm run dev
```

The local website is served at `http://localhost:4173`. Stop the temporary preview server after browser checks. Source lives in `src/`; `scripts/build.mjs` generates `dist/`.

## Pages

- `/` — Homepage
- `/platform/` — Learning layer, workflow, and sources
- `/solutions/` — Data teams, business teams, financial services, and technology
- `/security/` — Pilot security approach and FAQ
- `/about/` — Purpose and founding team
- `/pilot/` — Pilot enquiry and timeline
- `/resources/` — Field notes
- `/resources/context/` — The context problem
- `/resources/learning/` — The learning loop
- `/resources/pilot-guide/` — Eight-week pilot guide
- `/privacy/` — Website privacy
- `404.html` — Branded not-found page

## Contact behavior

General contact links and the pilot form address both `nikshayyadav90@gmail.com` and `akshitarora.iitd.ep@gmail.com`. Individual contact addresses are visible in the footer and pilot page. The pilot form validates required fields and composes an email using `mailto:`. Visitors must send it from their email application. The website does not submit or persist form data and has no backend, analytics, advertising cookies, or third-party scripts. Motion preferences can be stored locally in the browser.

## Content grounding

The founder-provided Google Drive Tacit folder contained Startup Brief, System Architecture, Idea to Revenue, and Week 1 One-Pager. The newer One-Pager and Idea to Revenue define the primary positioning: a lean data team, company-specific knowledge, human review, own-cloud deployment, and an eight-week pilot. Integrations and security controls are described as pilot scope / product direction rather than established capabilities. The product answer uses clearly labeled illustrative data. No customer endorsements, certifications, or performance results are invented.

## Reference assets

`reference/` contains screenshots captured from `https://jedify.com/` during the task. This folder is excluded from Vercel deployment.

The founder-selected background footage is [Programmers at Work by cottonbro studio](https://www.pexels.com/video/programmers-at-work-6804114/), used under the [Pexels license](https://www.pexels.com/license/). `team-work.mp4` is a locally optimized H.264 version with no audio, shared by both background sections. `team-work.jpg` is an extracted fallback frame used by both videos and the reduced-motion layout. The old hero and warehouse videos have been removed.

The supplied design reference's poster and industry photographs remain in `public/assets/`. Original names: `jdf-hero-poster-v2.jpg` and `jdf-solutions-{financial-services-photo,technology-solar,pharma-cross,manufacturing-photo,supply-chain-warehouse}.jpg`. No Jedify logo, customer marks, testimonials, certification badges, tracking, or product copy is embedded in the site. Fonts are Inter and Space Grotesk from Google Fonts. The Tacit mark is an original simple T monogram.

## Deploy

`vercel.json` selects the static `dist` output and the local build command. Deploy the project root using Vercel. No environment variables are required.

## Validation

The build and static checks cover every generated page, local asset, link, and anchor. Browser checks cover responsive document widths, labeled form inputs, menu controls, industry tabs, product-story navigation, disclosures, and contact destinations. Visual review uses the supplied reference screenshots and desktop/mobile static renders when the browser's screenshot service is unavailable.

## Motion and interaction

`src/motion.js` and `src/motion.css` implement the reference motion study using Tacit content:

- A continuous source-name strip and a clipped, vertical hero word rotator.
- Industry panels on an actual sliding track, including neighboring panels, drag/swipe support, keyboard controls, a six-second cycle, progress lines, and hover/focus pause.
- Expanding workflow cards using illustrative examples in place of customer testimonials.
- A video panel that grows from the page gutter to full width during native scrolling, with seven crossfading panels and staged answer cards.
- Four learning steps with seven-second cycles, hover pause, smooth disclosure, a masked video, staged answer cards, progressive text, and an original isometric Tacit T over source tiles.
- All automatic sequences stop while off screen, while the document is hidden, or when motion is paused. Reduced motion leaves the complete example visible with working manual controls.

The videos and notes in `reference/` document the reference study; they are excluded from deployment. `main` remains the original production site, while the feature branch is deployed to the public review alias.

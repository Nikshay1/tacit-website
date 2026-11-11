# Tacit website

A complete, responsive marketing website for Tacit. Eleven static pages share a common navigation, visual system, and footer. The design follows the supplied Jedify reference: full-screen video, inset translucent navigation, Space Grotesk / Inter typography, image tabs, a product story, a dark learning-layer section, and a dotted closing CTA.

## Develop

Requires Node.js 20+ and Python 3 for the optional local server. There are no npm dependencies.

```sh
npm run build
npm run check
npm run dev
```

The local website is served at `http://localhost:4173`. Source lives in `src/`; `scripts/build.mjs` generates `dist/`.

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

Contact links use `nikshayyadav90@gmail.com`. The pilot form validates required fields and composes an email using `mailto:`. Visitors must send it from their email application. The website does not submit or persist form data and has no backend, analytics, advertising cookies, or third-party scripts. Motion preferences can be stored locally in the browser.

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

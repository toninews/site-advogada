# Maria Silva Advocacia - Institutional Website

Modern institutional website focused on **credibility, conversion, and performance**, built with modular PHP sections and static export support.

The project combines:
- semantic content structure for legal services;
- conversion-oriented UX (WhatsApp and contact funnel);
- responsive UI with mobile-first behavior;
- practical production concerns (SEO, caching, deployment flow).

## Live Purpose

This repository represents a legal-services landing page template with real-world implementation patterns:
- sectioned storytelling (`About`, `History`, `Practice Areas`, `Services`, `Articles`, `Contact`);
- lead capture via form and WhatsApp CTAs;
- lightweight stack with easy maintenance;
- static build compatibility for CDN-first hosting.

## Core Features

- Modular page composition with PHP includes.
- Full static generation (`index.html`) from the same source components.
- Contact form UX with front-end validation and phone masking.
- Service cards linked to WhatsApp with prefilled context messages.
- Embedded Google Maps section (city-level reference).
- Article listing integration from external API endpoint.
- Mobile menu with accessibility attributes and touch-friendly interaction.

## Tech Stack

- **HTML5** (semantic structure)
- **CSS3** (`css/main.css` + `flexboxgrid`)
- **Vanilla JavaScript** (section-local scripts)
- **PHP** (component composition)
- **Bash** (static build pipeline)

## Project Structure

```text
.
|- index.php
|- index.html
|- build-static.sh
|- header.php
|- carousel.php
|- about.php
|- history.php
|- areas.php
|- services.php
|- articles.php
|- contact.php
|- footer.php
|- css/
|  |- flexboxgrid.css
|  |- main.css
|- images/
|- videos/
|- vercel.json
```

## Run Locally

### 1) PHP mode (recommended for development)

```bash
php -S localhost:8000
```

Open: `http://localhost:8000`

### 2) Static build mode

```bash
./build-static.sh
```

This regenerates:
- `index.html` (main page)
- `artigos/<slug>/index.html` (one static page per published article, with SEO tags pre-rendered in `<head>`)

Optional environment variables for static article generation:

```bash
ARTICLES_API_BASE="https://your-api.example.com" SITE_BASE_URL="https://your-site.example.com" GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com" ./build-static.sh
```

## Deployment

### PHP hosting

Deploy project as-is and serve `index.php`.

### Static hosting (Vercel/CDN)

Build first:

```bash
./build-static.sh
```

Then deploy:
- `index.html`
- `artigos/`
- assets (`css`, `images`, `videos`)

## Performance Notes

Current setup includes:
- responsive images with `srcset`/`sizes`;
- optimized media formats (AVIF/WebP);
- lazy/eager loading strategy by context;
- Google domain preconnect for map loading;
- immutable cache headers for static assets in `vercel.json`.

`vercel.json` applies long-lived caching for:
- `/css/*`
- `/images/*`
- `/videos/*`

## SEO & Accessibility

Implemented baseline:
- canonical URL;
- Open Graph metadata;
- semantic headings and sectioning;
- ARIA labels and `aria-live` where needed;
- keyboard-friendly interaction states (`:focus-visible`).

## Security / Hardening

Operational and hardening guidance is documented in:

- `HARDENING-CHECKLIST.txt`

Use it before production releases (environment checks, headers, CORS posture, deployment hygiene).

## Workflow Recommendation

1. Edit section files (`*.php`) and styles (`css/main.css`).
2. Validate locally in PHP mode.
3. Regenerate static output with `./build-static.sh`.
4. Review `git diff`.
5. Commit and deploy.

## Notes

- Some content and contact data are placeholders/template values.
- This repository is suitable as a production starter for small/medium institutional websites.

## Author

Developed by **Tony News**.

# The Divine Story

Photography portfolio of Zoltán Etédi — React 19, Vite 8, Tailwind CSS 4, deployed to Firebase Hosting
(`https://photo-12738.web.app`) on every push to `main`.

## Run locally

```sh
npm install
npm run dev        # http://localhost:3000
npm run build      # type-check + production build into dist/
```

## Photos

Master images live in `photos/` and are never served directly. After adding or replacing one, run:

```sh
npm run images
```

This writes responsive WebP variants to `public/images/`, regenerates `src/data/photos.json` (sizes, colour,
blur placeholder), renders the Open Graph card `public/og.jpg` from `scripts/og.html` with headless Chrome
(set `CHROME_PATH` if Chrome isn't in a standard location), and the touch icon. Commit the results.

Titles and alt text for the carousel are in `src/photos.ts`; social links and the site URL in `src/site.ts`.

## How the glass works

- **Loupe** (`src/lib/lens.ts`, `src/components/Loupe.tsx`) — a WebGL hemisphere of glass resting on the photo.
  Each pixel's ray is refracted by Snell's law per colour channel, with Fresnel reflection, a specular highlight
  and a cast shadow. It follows the pointer, drifts when idle, and a tap places it on touch screens.
- **Glass surfaces** (`src/lib/glass.ts`, `src/components/Glass.tsx`) — the header pills, buttons and the quote
  card refract what scrolls beneath them through an SVG displacement map computed from a curved-rim profile.
  This needs Chromium's SVG `backdrop-filter`; other browsers get frosted glass.

Motion respects `prefers-reduced-motion`, and glass falls back to solid surfaces under
`prefers-reduced-transparency`.

## Contact form

The form validates input but does not deliver messages yet — `handleSubmit` in
`src/components/ContactForm.tsx` only simulates sending. Connect it to a form service or a Cloud Function
before relying on it.

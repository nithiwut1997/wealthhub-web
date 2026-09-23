# WealthHub Web

The frontend foundation for WealthHub, a personal investment portfolio and wealth tracking application.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app` — App Router layouts, pages, global styles, and route entry points.
- `src/components` — small shared application-shell, navigation, and presentation components.
- `public` — static assets (when added).

The project intentionally has no data layer yet. API access and server-state tooling can be introduced in a dedicated module when WealthHub connects to its Spring Boot backend.

## Scripts

- `npm run dev` — start the local development server.
- `npm run build` — create a production build.
- `npm run lint` — run ESLint.
- `npm start` — serve the production build.

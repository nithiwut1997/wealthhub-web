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

The dashboard uses TanStack Query and a small typed client to call the WealthHub Spring Boot API. It loads portfolios from `GET /api/v1/portfolios`, the selected portfolio's totals from `GET /api/v1/portfolios/{portfolioId}/summary`, and its holdings from `GET /api/v1/holdings?portfolioId={portfolioId}`.

Copy the example environment file before starting the app:

```bash
cp .env.example .env.local
```

`NEXT_PUBLIC_API_BASE_URL` must point to the running backend (the example uses `http://localhost:8080`). Because requests are made by the browser, the backend must allow the frontend origin when the two applications run on different origins.

## Scripts

- `npm run dev` — start the local development server.
- `npm run build` — create a production build.
- `npm run lint` — run ESLint.
- `npm start` — serve the production build.

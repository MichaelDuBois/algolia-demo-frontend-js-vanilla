# Algolia Demo Frontend — Vanilla JavaScript + Express

A framework-free product-search demo built with [Algolia InstantSearch.js](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/), Vite, and Express. Vite builds the browser assets and Express serves the production build. It includes autocomplete, a product-results page, and an expandable horizontal brand refinement list.

## Run locally

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://127.0.0.1:5173`). The InstantSearch page is available at `/instantsearch.html`.

## Build

```sh
npm run build
npm start
```

Express serves the built site at `http://localhost:3000`. Set `PORT` to use a different port.

## Configure secured Algolia API keys

The app doesn't put a parent Algolia key in browser source code. Instead, Express creates a short-lived secured key for the browser at `/api/algolia-search-key`. That key is limited to the configured indexes and expires after one hour.

1. In the Algolia dashboard, create a **new dedicated parent API key** with the **Search** ACL and access to every configured index. Do not use an Admin API key or another secured API key as the parent.
2. Copy `.env.example` to `.env`, add your Algolia application ID and parent Search API key, and set `ALGOLIA_INDEX_NAMES` to the comma-separated indexes the browser needs. The `.env` file is ignored by Git.
3. Because the old browser key was exposed, revoke it in the Algolia dashboard after confirming the app works with the new key.
4. Build and run the app:

```sh
npm run build
npm start
```

The secured key will still appear in browser network traffic. Its index restriction and expiration are signed by Algolia, so the browser can't remove or broaden them. Protecting the key endpoint with authentication or rate limiting is the next step when this demo has user accounts or is exposed publicly.

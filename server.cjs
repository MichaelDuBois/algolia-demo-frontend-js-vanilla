const express = require('express');
const path = require('node:path');
const algoliasearch = require('algoliasearch').default;

require('dotenv').config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.join(__dirname, 'dist');
const appId = requiredEnvironmentVariable('ALGOLIA_APP_ID');
const parentSearchApiKey = requiredEnvironmentVariable(
  'ALGOLIA_PARENT_SEARCH_API_KEY'
);
const indexNames = (process.env.ALGOLIA_INDEX_NAMES || 'dev_programs')
  .split(',')
  .map((indexName) => indexName.trim())
  .filter(Boolean);
const securedKeyTtlSeconds = Number.parseInt(
  process.env.ALGOLIA_SECURED_KEY_TTL_SECONDS || '3600',
  10
);
const algoliaClient = algoliasearch(appId, parentSearchApiKey);

if (!Number.isFinite(securedKeyTtlSeconds) || securedKeyTtlSeconds <= 0) {
  throw new Error('ALGOLIA_SECURED_KEY_TTL_SECONDS must be a positive number.');
}

if (indexNames.length === 0) {
  throw new Error('ALGOLIA_INDEX_NAMES must include at least one index name.');
}

app.get('/api/algolia-search-key', (_request, response) => {
  const validUntil = Math.floor(Date.now() / 1000) + securedKeyTtlSeconds;
  const securedApiKey = algoliaClient.generateSecuredApiKey(
    parentSearchApiKey,
    {
      restrictIndices: indexNames,
      validUntil,
    }
  );

  response.set('Cache-Control', 'no-store').json({
    appId,
    apiKey: securedApiKey,
    expiresAt: validUntil,
  });
});

app.use(express.static(publicDirectory));

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

function requiredEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

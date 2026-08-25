import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import algoliasearch from 'algoliasearch';
import { getAlgoliaSearchCredentials } from './algolia-credentials';

import '@algolia/autocomplete-theme-classic';

startAutocomplete().catch((error) => {
  console.error('Unable to start autocomplete.', error);
});

async function startAutocomplete() {
  const { appId, apiKey } = await getAlgoliaSearchCredentials();
  const searchClient = algoliasearch(appId, apiKey);

  const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
    key: 'RECENT_SEARCHES',
    limit: 5,
    transformSource({ source }) {
      return {
        ...source,
        templates: {
          ...source.templates,
          header() {
            return 'Recent searches';
          },
        },
      };
    },
  });

  const querySuggestionsPlugin = createQuerySuggestionsPlugin({
    searchClient,
    indexName: 'dev_programs_query_suggestions',
    getSearchParams() {
      return { hitsPerPage: 5 };
    },
    transformSource({ source }) {
      return {
        ...source,
        templates: {
          ...source.templates,
          header() {
            return 'Popular Searches / Suggests:';
          },
        },
      };
    },
  });

  autocomplete({
    container: '#autocomplete',
    placeholder: "Search dev_programs — try 'mba' or 'development'",
    openOnFocus: true,
    debug: true,
    plugins: [recentSearchesPlugin, querySuggestionsPlugin],
    getSources({ query }) {
      if (!query) {
        return [
          {
            sourceId: 'quickAccess',
            async getItems() {
              const response = await searchClient.search([
                {
                  indexName: 'dev_programs',
                  query: '',
                  params: { hitsPerPage: 0 },
                },
              ]);
              return response.results[0].userData?.[0]?.quickAccess || [];
            },
            onSelect({ item }) {
              window.location.href = item.url;
            },
            templates: {
              header() {
                return 'Quick Access:';
              },
              item({ item }) {
                return `${item.title} - ${item.description}`;
              },
            },
          },
        ];
      }

      return [
        {
          sourceId: 'dev_programs',
          onSelect({ item }) {
            window.location.href = `./product.html?objectID=${encodeURIComponent(
              item.objectID
            )}`;
          },
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'dev_programs',
                  query,
                  params: { hitsPerPage: 5 },
                },
              ],
            });
          },
          templates: {
            header() {
              return 'Programs';
            },
            item({ item, html }) {
              return html`<div class="autocomplete-product">
                ${item.image && html`<img src=${item.image} alt="" />`}
                <div>
                  <strong>${item.name}</strong>
                  ${item.brand && html`<span>${item.brand}</span>`}
                  ${item.price != null && html`<span>$${item.price}</span>`}
                </div>
              </div>`;
            },
          },
        },
      ];
    },
    onSubmit({ state }) {
      window.location.href = `./instantsearch.html?q=${encodeURIComponent(
        state.query
      )}`;
    },
  });
}

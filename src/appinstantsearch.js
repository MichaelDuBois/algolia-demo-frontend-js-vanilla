import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  searchBox,
  hits,
  pagination,
  queryRuleCustomData,
} from 'instantsearch.js/es/widgets';
import { getAlgoliaSearchCredentials } from './algolia-credentials';

startInstantSearch().catch((error) => {
  console.error('Unable to start InstantSearch.', error);
});

async function startInstantSearch() {
  const { appId, apiKey } = await getAlgoliaSearchCredentials();
  const searchClient = algoliasearch(appId, apiKey);

  const indexName = 'dev_programs';

  const search = instantsearch({
    indexName,
    searchClient,
    routing: {
      stateMapping: {
        stateToRoute(uiState) {
          const indexUiState = uiState[indexName] || {};
          return {
            q: indexUiState.query,
            page: indexUiState.page,
          };
        },
        routeToState(routeState) {
          return {
            [indexName]: {
              query: routeState.q || '',
              page: routeState.page,
            },
          };
        },
      },
    },
  });

  search.addWidgets([
    searchBox({
      container: '#searchbox',
      // Search only on submit, so a partial SKU never triggers the redirect rule.
      searchAsYouType: false,
    }),
    hits({
      container: '#hits',
      templates: {
        item(hit, { html }) {
          const title = hit.name || hit.objectID;
          const categories = Array.isArray(hit.categories)
            ? hit.categories.join(' › ')
            : hit.hierarchicalCategories?.lvl1 || hit.hierarchicalCategories?.lvl0;
          const productUrl = `./product.html?objectID=${encodeURIComponent(
            hit.objectID
          )}`;

          return html`<article class="search-result">
            <a class="search-result__image-link" href=${productUrl}>
              ${hit.image && html`<img src=${hit.image} alt=${title} />`}
            </a>
            <div>
              ${hit.brand && html`<p class="search-result__brand">${hit.brand}</p>`}
              <h2><a href=${productUrl}>${title}</a></h2>
              ${hit.price != null &&
                html`<p class="search-result__price">$${Number(hit.price).toFixed(2)}</p>`}
              ${categories && html`<p class="search-result__categories">${categories}</p>`}
              ${hit.description && html`<p>${hit.description}</p>`}
            </div>
          </article>`;
        },
      },
    }),
    pagination({
      container: '#pagination',
    }),
    queryRuleCustomData({
      container: '#query-rule-redirect',
      templates: {
        default: () => '',
      },
      transformItems(items, { results }) {
        // The SKU rule fires on an exact skus match; the SKU is the product's objectID.
        if (results && items.some((item) => item.redirectToSkuProduct === true)) {
          window.location.replace(
            `./product.html?objectID=${encodeURIComponent(results.query)}`
          );
        }

        return [];
      },
    }),
  ]);

  search.start();
}

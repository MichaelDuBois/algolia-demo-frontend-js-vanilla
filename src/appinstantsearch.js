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
  const initialQuery = new URLSearchParams(window.location.search).get('q') || '';
  // PDP redirect for the latest results, keyed by the query that triggered the SKU rule.
  let ruleRedirect = { query: null, url: null };
  let hasCheckedInitialQuery = false;

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
    }),
    hits({
      container: '#hits',
      templates: {
        item(hit, { html }) {
          const title = hit.name || hit.objectID;
          const categories = Array.isArray(hit.categories)
            ? hit.categories.join(' › ')
            : hit.hierarchicalCategories?.lvl1 || hit.hierarchicalCategories?.lvl0;
          const productUrl = getProductUrl(hit.objectID);

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
        if (!results) {
          return [];
        }

        const isSkuMatch = items.some((item) => item.redirectToSkuProduct === true);
        const skuHit = isSkuMatch ? findHitWithSku(results.hits, results.query) : null;
        ruleRedirect = {
          query: results.query,
          url: skuHit ? getProductUrl(skuHit.objectID) : null,
        };

        // Redirect when the page is opened with a query (e.g. submitted from autocomplete).
        if (!hasCheckedInitialQuery && results.query === initialQuery) {
          hasCheckedInitialQuery = true;
          redirectToRuleUrl(initialQuery);
        }

        return [];
      },
    }),
  ]);

  // Only redirect on submit, not as the user types, so partial SKUs never trigger a jump.
  // Capture phase: the searchBox widget stops the submit event from bubbling.
  document.querySelector('#searchbox').addEventListener(
    'submit',
    (event) => {
      const input = event.target.querySelector('input[type="search"]');
      redirectToRuleUrl(input ? input.value : '');
    },
    true
  );

  function redirectToRuleUrl(query) {
    if (ruleRedirect.url && ruleRedirect.query === query) {
      // replace() keeps the redirecting search URL out of history, so Back doesn't loop.
      window.location.replace(ruleRedirect.url);
    }
  }

  search.start();
}

function getProductUrl(objectID) {
  return `./product.html?objectID=${encodeURIComponent(objectID)}`;
}

// The rule only says "the query is some SKU"; find which hit owns that exact SKU.
function findHitWithSku(hitsList, query) {
  const normalizedQuery = query.trim().toLowerCase();

  return hitsList.find((hit) =>
    [].concat(hit.skus || []).some(
      (sku) => String(sku).trim().toLowerCase() === normalizedQuery
    )
  );
}

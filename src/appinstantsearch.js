import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  configure,
  searchBox,
  hits,
  refinementList,
  dynamicWidgets,
  pagination,
} from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'OUR12RLLSJ',
  'ffc904c8dab7f0b0e75ec7f2110170c1'
);

const indexName = 'products';

const globalVar = 'helloworld';

const search = instantsearch({
  indexName: indexName,
  searchClient,
  insights: true,
  routing: {
    stateMapping: {
      stateToRoute(uiState) {
        console.log(uiState);
        const indexUiState = uiState[indexName];
        return {
          q: indexUiState.query,
          categoriessss: indexUiState.menu && indexUiState.menu.categories,
          brandssss:
            indexUiState.refinementList && indexUiState.refinementList.brand,
          page: indexUiState.page,
          tab: globalVar,
        };
      },
      routeToState(routeState) {
        return {
          [indexName]: {
            query: routeState.q,
            menu: {
              categories: routeState.categories,
            },
            refinementList: {
              brand: routeState.brand,
            },
            page: routeState.page,
          },
        };
      },
    },
  },
});

search.addWidgets([
  configure({
    getRankingInfo: true,
  }),
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    templates: {
      item(hit, { html, sendEvent }) {
        const featuredBadge = hit._rankingInfo?.promoted
          ? html`<span class="hit-badge">Featured</span>`
          : null;
        const productUrl = `./product.html?objectID=${encodeURIComponent(hit.objectID)}`;

        // Define the templates
        const template1 = html`<div class="hit-template-1">
                            ${featuredBadge}
                            <h2>
                              <a href=${productUrl}>
                                ${hit.name}
                              </a>
                            </h2>
                            <p> Apple! </p>
                            <button
                              type="button"
                              onClick=${() =>
                                sendEvent('conversion', hit, 'Product Added to Cart')}
                            >
                              Add to cart
                            </button>
                          </div>`;

        const template2 = html`<div class="hit-template-2">
                            ${featuredBadge}
                            <h3><a href=${productUrl}>${hit.name}</a></h3>
                            <span>${hit.price}</span>
                            <button
                              type="button"
                              onClick=${() =>
                                sendEvent('conversion', hit, 'Product Added to Cart')}
                            >
                              Add to cart
                            </button>
                          </div>`;

        // Apply different templates based on a condition
        if (hit.brand === 'Apple') {
          return template1;
        } else {
          return template2;
        }
      },
    },
    transformItems(items) {
      // Optionally transform items if necessary
      return items.map((item) => {
        if (item.type === 'type1') {
          item.customTemplate = 'template1';
        } else if (item.type === 'type2') {
          item.customTemplate = 'template2';
        } else {
          item.customTemplate = 'default';
        }
        return item;
      });
    },
  }),
  dynamicWidgets({
    container: '#dynamic-widgets',
    // Widgets are rendered in the facet order configured in the Algolia
    // dashboard. This known widget keeps Brand's current options.
    widgets: [
      (container) =>
        refinementList({
          container,
          attribute: 'brand',
          limit: 4,
          showMore: true,
          showMoreLimit: 1000,
        }),
    ],
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();

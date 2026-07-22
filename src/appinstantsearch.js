import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { connectConfigure } from 'instantsearch.js/es/connectors';
import {
  searchBox,
  hits,
  refinementList,
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
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    templates: {
      item(hit) {
        // Define the templates
        const template1 = `<div class="hit-template-1">
                            <h2>${hit.name}</h2>
                            <p> Apple! </p>
                          </div>`;

        const template2 = `<div class="hit-template-2">
                            <h3>${hit.name}</h3>
                            <span>${hit.price}</span>
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
  refinementList({
    container: '#brand-list',
    attribute: 'brand',
    limit: 4,
    showMore: true,
    showMoreLimit: 1000,
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();

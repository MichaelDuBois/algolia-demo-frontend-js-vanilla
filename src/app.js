import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import algoliasearch from 'algoliasearch';

import '@algolia/autocomplete-theme-classic';

const searchClient = algoliasearch(
  'OUR12RLLSJ',
  'ffc904c8dab7f0b0e75ec7f2110170c1'
);

autocomplete({
  container: '#autocomplete',
  placeholder: "type 'apple' and press enter", //type help for rule redirect
  debug: true,
  onSubmit({ state }) {
    console.log(state);
    window.location.href =
      './instantsearch.html?q=' + encodeURIComponent(state.query);
  },
  getSources({ query, setContext }) {
    return [
      {
        sourceId: 'items',
        getItems() {
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: 'products',
                query,
              },
            ],
          });
        },
        templates: {
          item({ item, html }) {
            return html`<div>${item.name}</div>`;
          },
        },
      },
    ];
  },
});

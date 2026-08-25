import aa from 'search-insights';
import algoliasearch from 'algoliasearch/lite';
import { getAlgoliaSearchCredentials } from './algolia-credentials';

const index = 'dev_programs';
const objectID = new URLSearchParams(window.location.search).get('objectID');

startProductTracking().catch((error) => {
  console.error('Unable to start product analytics.', error);
});

async function startProductTracking() {
  const { appId, apiKey } = await getAlgoliaSearchCredentials();
  const product = await algoliasearch(appId, apiKey)
    .initIndex(index)
    .getObject(objectID);

  aa('init', { appId, apiKey });
  window.aa = aa;

  renderProduct(product);

  const addButton = document.querySelector('.product-add-button');
  addButton.disabled = false;
  addButton.addEventListener('click', (event) => {
    aa('addedToCartObjectIDs', {
      eventName: 'Product Added to Cart',
      index,
      objectIDs: [objectID],
    });

    event.currentTarget.textContent = 'Added to cart';
    event.currentTarget.disabled = true;
  });
}

function renderProduct(product) {
  const categories = Array.isArray(product.categories)
    ? product.categories.join(' › ')
    : product.hierarchicalCategories?.lvl1 || product.hierarchicalCategories?.lvl0 || '';
  const price = Number(product.price);
  const image = document.querySelector('.product-image');
  const sourceLink = document.querySelector('[data-product-source]');

  document.title = `${product.name} — Demo Store`;
  document.querySelector('[data-product-brand]').textContent = product.brand || '';
  document.querySelector('[data-product-name]').textContent = product.name || product.objectID;
  document.querySelector('[data-product-price]').textContent = Number.isFinite(price)
    ? `$${price.toFixed(2)}`
    : '';
  document.querySelector('[data-product-categories]').textContent = categories;
  document.querySelector('[data-product-description]').textContent = product.description || '';

  if (product.image) {
    image.src = product.image;
    image.alt = product.name || '';
    image.hidden = false;
  }

  if (product.url) {
    sourceLink.href = product.url;
    sourceLink.hidden = false;
  }
}

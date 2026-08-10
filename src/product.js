import aa from 'search-insights';

const appId = 'OUR12RLLSJ';
const apiKey = 'ffc904c8dab7f0b0e75ec7f2110170c1';
const index = 'products';
const objectID =
  new URLSearchParams(window.location.search).get('objectID') || 'iphone-16-pro-demo';

aa('init', { appId, apiKey });
window.aa = aa;

document.querySelector('.product-add-button').addEventListener('click', (event) => {
  aa('addedToCartObjectIDs', {
    eventName: 'Product Added to Cart',
    index,
    objectIDs: [objectID],
  });

  event.currentTarget.textContent = 'Added to cart';
  event.currentTarget.disabled = true;
});

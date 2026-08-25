export async function getAlgoliaSearchCredentials() {
  const response = await fetch('/api/algolia-search-key');

  if (!response.ok) {
    throw new Error('Unable to retrieve an Algolia secured API key.');
  }

  return response.json();
}

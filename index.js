/* global addEventListener, Request, Response, fetch */

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

const getStorageUrl = cdnUrl => {
  const url = new URL(cdnUrl);
  const path = url.pathname;
  
  // remove the /static path to match the bucket name
  const resource = path.substring(7);  
  const target = 'storage.googleapis.com';
  
  url.hostname = target;
  url.pathname = resource;

  return url;
};

async function handle(request) {

  const url = getStorageUrl(request.url);

  const originRequest = new Request(url.toString(), {headers: request.headers});

  let response = await fetch(originRequest, {
    cf: {
      // Always cache this fetch regardless of content type
      // for a max of 31 days before revalidating the resource
      cacheTtl: 2678400,
      cacheEverything: true,
    },
  });

  response = new Response(response.body, response);

  return response;
}

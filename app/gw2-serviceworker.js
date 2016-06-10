/**
 * Created by darkmane on 6/3/16.
 */

(function (global) {

  const BASE_URI = "https://api.guildwars2.com";
  const ITEM_PREFIX = "gw2_item_";

  const VERSION = 1;
  let CURRENT_CACHES = {
    site: `site-v${VERSION}`,
    icon: `item_icon`,
    item: `item_info`,
    recipe: `recipe_info`
  }

  function fetchHandler(request, cache_name) {
    return caches.match(request).then(function(response) {
      if (response) {
        console.log('Found response in cache:', response);

        return response;
      }
      console.log('No response found in cache. About to fetch from network...');

      return fetch(request.url).then(function(response) {
        console.log('Response from network is:', response);

        return response;
      }).catch(function(error) {
        console.error('Fetching failed:', error);

        throw error;
      });
    })

    //return caches.match(event.request).catch(function () {
    //  return global.fetch(event.request).then(function (response) {
    //    return global.caches.open(cache_name).then(function (cache) {
    //      cache.put(event.request, response.clone());
    //      return response;
    //    });
    //  });
    //}).catch(function () {
    //  return global.caches.match('/sw-test/gallery/myLittleVader.jpg');
    //});


  }

  global.recipeFetchHandler = function (request, values, options) {
    console.log("Recipe handler" );
    return fetchHandler(request, CURRENT_CACHES.recipe);
  }


})(self);

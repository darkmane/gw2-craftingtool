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
        return response;
      }
      console.log('No response found in cache. About to fetch from network...');

      return fetch(request.url).then(function(response) {
        return response;
      }).catch(function(error) {
        console.error('Fetching failed:', error);

        throw error;
      });
    })
  }

  global.recipeFetchHandler = function (request, values, options) {
    return fetchHandler(request, CURRENT_CACHES.recipe);
  }


})(self);

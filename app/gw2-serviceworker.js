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

  function fetchHandler(event, cache_name) {
    let cachedResponse = caches.match(event.request).catch(function () {
      return global.fetch(event.request).then(function (response) {
        return global.caches.open(cache_name).then(function (cache) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(function () {
      return global.caches.match('/sw-test/gallery/myLittleVader.jpg');
    });

    event.respondWith(cachedResponse);
  }

  global.itemFetchHandler = function (event, values, options) {
    console.log("Item handler" );
    return fetchHandler(event, CURRENT_CACHES.item);
  }

  global.iconFetchHandler = function (event, values, options) {
    console.log("icon handler" );
    return fetchHandler(event, CURRENT_CACHES.icon);
  }

  global.recipeFetchHandler = function (event, values, options) {
    console.log("Recipe handler" );
    return fetchHandler(event, CURRENT_CACHES.recipe);
  }

  global.siteFetchHandler = function (event, values, options) {
    console.log("Site handler" );
    return fetchHandler(event, CURRENT_CACHES.site);
  }

})(self);

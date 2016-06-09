/**
 * Created by darkmane on 3/18/16.
 */

var GW2_API = "https://api.guildwars2.com";
var ITEM_PREFIX = "gw2_item_";

function getJSON (url) {

  return fetch(url).then( r => r.json());

}


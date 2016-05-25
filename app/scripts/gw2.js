/**
 * Created by darkmane on 3/18/16.
 */

var BASE_URI = "https://api.guildwars2.com";
var ITEM_PREFIX = "gw2_item_";

function getJSON (url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  }).then(JSON.parse);
}

var item = function(id) {
  this.id = id;

  var storedVal = __retrieve(id);
  if(storedVal == null) {
    this.name = "";
    this.type = "";
    this.level = 0;
    this.rarity = "";
    this.vendor_value = 0;
    this.default_skin = 0;
    this.game_types = [];
    this.flags = [];
    this.restrictions = [];
    this.chat_link = "";
    this.icon = "";
    this.details = {};
    this.__recipe = [];
    this.update_deadline = new Date();

  }else{
    this.name = storedVal.name;
    this.type = storedVal.type;
    this.level = storedVal.level;
    this.rarity = storedVal.rarity;
    this.vendor_value = storedVal.vendor_value;
    this.default_skin = storedVal.default_skin;
    this.game_types = storedVal.game_types;
    this.flags = storedVal.flags;
    this.restrictions = storedVal.restrictions;
    this.chat_link = storedVal.chat_link;
    this.icon = storedVal.icon;
    this.details = storedVal.details;
    this.__recipe = storedVal.__recipe;
    this.update_deadline = storedVal.update_deadline;

  }
  this.isOutdated = function () {
    return this.update_deadline <= (new Date());
  }

  return this;
}

item.prototype.__retrieve= function(){
  return __retrieve(this.id);
}

item.prototype.__store = function(){
  __store(this);
}



function __retrieve(id){
  return localStorage.getItem(ITEM_PREFIX + id);
}

function __store(item){
  item.update_deadline = getFutureDate(7);
  localStorage.setItem(ITEM_PREFIX + item.id, item);
}

item.prototype.update = function() {
  if(this.isOutdated()) {
    var oldItem = this;
    var newItem = getJSON(BASE_URI + '/v2/items/' + this.id).done(function (newItem) {
      console.log("WHOO HOO!");
      if(newItem != null){
        oldItem.name = newItem.name;
        oldItem.type = newItem.type;
        oldItem.level = newItem.level;
        oldItem.rarity = newItem.rarity;
        oldItem.vendor_value = newItem.vendor_value;
        oldItem.default_skin = newItem.default_skin;
        oldItem.game_types = newItem.game_types;
        oldItem.flags = newItem.flags;
        oldItem.restrictions = newItem.restrictions;
        oldItem.chat_link = newItem.chat_link;
        oldItem.icon = newItem.icon;
        oldItem.details = newItem.details;
        oldItem.__store();
        return this;
      }
      return newItem;
    }, function (error) {
      console.log(error.message);
    });
    if(newItem != null){
      this.name = newItem.name;
      this.type = newItem.type;
      this.level = newItem.level;
      this.rarity = newItem.rarity;
      this.vendor_value = newItem.vendor_value;
      this.default_skin = newItem.default_skin;
      this.game_types = newItem.game_types;
      this.flags = newItem.flags;
      this.restrictions = newItem.restrictions;
      this.chat_link = newItem.chat_link;
      this.icon = newItem.icon;
      this.details = newItem.details;
      this.__store();
      return this;
    }
  }
}

item.prototype.GetRecipe = function() {
  if(this.isOutdated()) {
    var recipe = getJSON(BASE_URI + "/v2/recipes/search?output=" + this.id, false)
      .then(function(recipes){
        return getJSON(BASE_URI + "/v2/recipes/" + recipes[0])
      }).then(function(recipe){
        var r = [];
        for(var counter = 0; counter < recipe.ingredients.length; counter++){
          var ingredient_id = recipe.ingredients[counter].id;
          var ingredient_count = recipe.ingredients[counter].count;
          var ingredient = new item(ingredient_id);
          ingredient.update();
          ingredient.GetRecipe();
          recipe.push({id: ingredient_id, item: ingredient, count: ingredient_count});
        }
        return r;
      }).catch(function(error){
        console.log(error.message)
      });

    this.__recipe = recipe;
		this.__store();

  } else {
		this.__retrieve();
	}

  return this.__recipe;
}

item.prototype.GetIngredients = function() {
  var r = this.GetRecipe();
  var ingredients = {};

  for(var counter = 0; counter < r.length; counter++){
    if(r[counter].GetIngredients().length == 0){
      if (!(r[counter].id in ingredients)){
        ingredients[r[counter].id] = r[counter];
      }else{
        ingredients[r[counter].id].count += r[counter].count;
      }
    } else{
      var list = r[counter].GetIngredients()
      for(var counter2 = 0; counter2 < list.length;counter2++){
        if (!(list[counter2].id in ingredients)){
          ingredients[list[counter2].id] = list[counter2];
        }else{
          ingredients[list[counter2].id].count += list[counter2].count;
        }
      }


    }
  }
  return rv;
}

function getFutureDate(days){
  var  result = new Date();
  result.setDate(result.getDate() + days);
  return result;
}

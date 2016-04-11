/**
 * Created by darkmane on 3/18/16.
 */

var baseURI = "http://api.guildwars2.com";


function itemList() {
  var storedVal = this.__retrieve()
  if(storedVal == null) {
    this.item_list = {};
    this.update_deadline = new Date();
  }else{
    this.item_list = storedVal.item_list;
    this.update_deadline = storedVal.update_deadline;
  }


}

itemList.prototype.__isOutdated = function(){
  return this.update_deadline <= (new Date());
}

itemList.prototype.update = function(){
  if(this.__isOutdated()) {
    var request = new XMLHttpRequest();
    request.open("GET", baseURI + "/v2/items", false);
    request.send(null);
    if (request.status === 200) {
      newItemList = request.response;
      for (var i = newItemList.length; i--;) {
        if (newItemList[i] in this.item_list) {
          newItemList.splice(i);
        }
      }

      while (newItemList.length > 0) {
        var sub_array = newItemList.slice(0, 9);
        request = new XMLHttpRequest();
        request.open("GET", baseURI + "/v2/items?ids=" + sub_array.toString(), false);
        request.send(null);

        if (request.status === 200) {
          var items = request.response;
          while (items.length > 0) {
            var item = items.slice(0, 1);
            this.item_list[item.id] = item.name;
          }
        }
      }
      this.update_deadline = getFutureDate(7);

    }
  }

  this.__store();

}

itemList.prototype.__store = function(){
  localStorage.setItem("gw2_item_list", this);
}

itemList.prototype.__retrieve = function(){
  return localStorage.getItem("gw2_item_list");
}

function item(id) {
  this.id = id;
  var storedVal = this.__retrieve();
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
    this.__recipe_id = null;
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
    this.__recipe_id = storedVal.__recipe_id;
    this.update_deadline = storedVal.update_deadline;
  }
  this.isOutdated = function () {
    return this.update_deadline <= (new Date());
  }
}

item.prototype.__retrieve = function(){
  return localStorage.getItem("gw2_item_" + this.id);
}

item.prototype.__store = function(){
  localStorage.setItem("gw2_item" + this.id, this);
}

item.prototype.update = function() {
  if(this.isOutdated()) {
    var request = new XMLHttpRequest();
    request.open("GET", baseURI + "/v2/items?ids=" + this.id, false);
    request.send(null);
    if (request.status === 200) {
      newItem = request.response;
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
      this.update_deadline = getFutureDate(7);
    }
    this.__store();
  }
}

item.prototype.GetRecipe = function() {
  if(this.isOutdated() || this.__recipe_id == null) {
    var request = new XMLHttpRequest();
    request.open("GET", baseURI + "/v2/recipes/search?output=" + this.id, false);
    request.send(null);
    if (request.status === 200) {
      var recipes = request.response;
      if (recipes.length > 0) {
        return new recipe(recipes[0]);
      }
    }
  }else{
    return new recipe(this.__recipe_id);
  }
  return null;
}

item.prototype.GetIngredients = function() {
  var r = this.GetRecipe();
  if(r == null)
    return [];

  var rv = [];
  for(var i = 0; i < r.ingredients.length; i++){
    var ingredient = r.ingredients[i];
    var sub_item = new item(ingredient.item_id);
    if(sub_item.GetIngredients() == []){
      rv.push({count: ingredient.count, item: sub_item});
    }else{
      var sub_ingredients = sub_item.GetIngredients();
      for(var j = 0; j< sub_ingredients.length; j++){
        rv.push({count: ingredient.count * sub_ingredients[j].count, item: sub_ingredients[j].item})
      }
    }
  }
  return rv;
}


function recipe(id){
  this.type = "";
  this.output_item_id = 0;
  this.output_item_count = 0;
  this.min_rating = 0;
  this.time_to_craft_ms = 0;
  this.disciplines = [];
  this.flags = [];
  this.ingredients = [];
  this.id = id;
  this.chat_link = "";
  this.update_deadline = new Date();
  this.isOutdated = function(){
    return this.update_deadline <= (new Date());
  }
}

recipe.prototype.Update = function(){
  var request = new XMLHttpRequest();
  request.open("GET", baseURI + "/v2/recipes?ids=" + this.id, false);
  request.send(null);
  if(request.status === 200){
    newRecipe = request.response;
    this.type = newRecipe.type;
    this.output_item_id  = newRecipe.output_item_id;
    this.output_item_count = newRecipe.output_item_count;
    this.min_rating = newRecipe.min_rating;
    this.time_to_craft_ms = newRecipe.time_to_craft_ms;
    this.disciplines = newRecipe.disciplines;
    this.flags = newRecipe.flags;
    this.ingredients = newRecipe.ingredients;
    this.chat_link = newRecipe.chat_link;
    this.update_deadline = getFutureDate(7);
  }
}

function getFutureDate(days){
  var  result = new Date();
  result.setDate(result.getDate() + days);
  return result;
}


module.exports = {
  registerRoutes: function (app) {
    app.get('/gw2_api/v2/items', success);
    app.get('/gw2_api/v2/items/:item_id', success);
    app.get('/gw2_api/v2/recipes', success);
    app.get('/gw2_api/v2/recipes/:recipe_id', success);
    app.get('/gw2_api/v2/account/bank', success);
    app.get('/gw2_api/v2/account/inventory', success);
    app.get('/gw2_api/v2/account/materials', success);
    app.get('/gw2_api/v2/account/materials/:material_id', success);
  }
}

function success(request, response){
  response.body = "{}";
  response.send(200);
}


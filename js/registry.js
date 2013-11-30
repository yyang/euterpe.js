(function(){

var registry = {};

$define(window, {Registry: {
  get: function(collection, name) {
    if (!registry[collection])
      registry[collection] = {}
    if (!registry[collection][name])
      registry[collection][name] = uuid.v1();
    return registry[collection][name];
  }
}});

})();
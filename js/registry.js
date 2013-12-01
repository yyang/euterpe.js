(function(){

var registry = {};

$define(window, {Registry: {
  get: function(collection, name) {
    if (arguments.length === 1)
      return collection + uuid.v1();
    if (!registry[collection])
      registry[collection] = {}
    if (!registry[collection][name])
      registry[collection][name] = collection + uuid.v1();
    return registry[collection][name];
  }
}});

})();
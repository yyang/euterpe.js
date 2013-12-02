(function(){

var registry = {};

$define(window, {Registry: {
  get: function(collection, name) {
    if (arguments.length === 1)
      return collection + '_' + uuid.v1();
    if (!registry[collection])
      registry[collection] = {}
    if (!registry[collection][name])
      registry[collection][name] = collection + '_' + uuid.v1();
    return registry[collection][name];
  }
}});

})();
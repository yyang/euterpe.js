(function(){
// Constants
var kSvgNS = 'http://www.w3.org/2000/svg';

// Graph Instances Storage
var graphInstances = {};
var graphTypes = {};

/** 
 * @typedef graphObject
 * @type {graphObject}
 * @property {String} id      UUID of the graph.
 * @property {String} type    Type of graph, should be a registered type.
 * @property {String} title   Title of graph.
 * @property {Object|Array} data      Data object.
 * @property {Object} options         Options object.
 * @property {Object} actions         Actions object.
 * @property {Object} canvasSize      Size of canvas.
 * @property {Number} canvasSize.w    Width of canvas.
 * @property {Number} canvasSize.h    Height of canvas.
 * @property {HTMLElement} container  Container of the graph.
 * @property {SVGElement} svg         Root SVG Element.
 * @property {CSSStyleSheet} css      Style Sheet Controller.
 */

/**
 * @typedef graphData
 * @type {graphData}
 * @property {String} name.
 * @property {String} id.
 * @property {String} status.
 * @property {Picker} picker          color picker.
 * @property {Array}  points          each type may have different definition.
 */

/**
 * Creates the parent class for Graph operations.
 * @param {String} type               Type of graph.
 * @param {Element|Stirng} container  Graph container, should be either string
 *                                    or HTMLElement.
 * @param {Object} data               Original data object.
 * @param {Object} options            Customized options object, including 
 *                                    title and actions.
 * @returns {graphObject}             The graph object.
 */

function Graph(type, container, data, options) {
  if (Object.keys(graphTypes).indexOf(type) === -1)
    throw 'Undefined graph type: ' + type;
  else
    this.__proto__ = graphTypes[type].prototype;
  this._graph(type, container, data, options ? options : {});
  return this;
}

$define(Graph, {
  __type: 'graph',
  _data: function(userData) {
    var data = [];
    if (typeof userData === 'object') {
      var keys = Object.keys(userData);
      for (var i = 0; i < keys.length; i++)
        data.push({
          name: keys[i],
          id: Registry.get('data', keys[i]),
          status: 'show',
          picker: Picker.get(keys[i]) ?
              Picker.get(keys[i]) : new Picker(keys[i]),
          points: userData[keys[i]].trait
        });
    } else if (typeof userData === 'array') {
      for (var i = 0; i < userData.length; i++)
        data.push({
          name: userData[i].name,
          id: Registry.get('data', userData[i].name),
          picker: userData[i].picker ?
              userData[i].picker : new Picker(userData[i].name),
          points: userData[i].points
        })
    } else {
      throw 'Incorrect data type.'
    }
    return data;
  }
})

$declare(Graph, {
  _graph: function(type, container, data, options) {
    // Initiate graph in graphInstances storage;
    this.id = uuid.v1();
    graphInstances[this.id] = this;
    this.type = type;
    // Container Element;
    this.container = container instanceof HTMLElement
        ? container
        : document.querySelector(container);
    this.canvasSize = this.container.$getSize();
    // SVG Element;
    this.svg = document.createElementNS(kSvgNS, 'svg');
    this.svg.setAttributes({
        'version': '1.1',
        'width': this.canvasSize.w,
        'height': this.canvasSize.h,
        'id': this.id
      });
    // CSS Style Sheet;
    var styleSheet = document.head.appendChild(document.createElement('style'));
    styleSheet.type = 'text/css';
    this.css = document.styleSheets[document.styleSheets.length-1];
    // Parameters;
    var self = this;
    this.data = Graph._data(data);
    this.options = graphTypes[type]._options(self, options);
    this.title = this.options.title;
    // Actions;
    this.actions = (options.actions) ? graphTypes[type]._actions(options) : {};
    // Render
    this.render();
    // Insert
    this.container.insertBefore(this.svg, null);
  },
  showSeries: function(name) {

  },
  hideSeries: function(name) {

  },
  highlightSeries: function(name) {

  },
  previewSeries: function(name) {

  },
  addSeries: function(name, data) {

  },
  removeSeries: function(name) {

  },
  refresh: function() {

  },
  resize: function(canvasSize) {

  }
});

function GraphType() {}

$define(GraphType, {
  register: function(Type) {
    if (!(Type._options instanceof Function && 
          Type._actions instanceof Function))
      throw 'Missing required graph methods for Type: ' + Type;
    graphTypes[Type.__type] = Type;
  },
  unregister: function(Type) {
    delete types[Type.__type];
  }
})

function allGraph() {}

$define(window, {
  Graph: Graph,
  allGraph: allGraph,
  GraphType: GraphType
});

})();
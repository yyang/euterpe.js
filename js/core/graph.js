(function(){
// Constants
var kSvgNS = 'http://www.w3.org/2000/svg';

// Graph Instances Storage
var graphInstances = {};
var graphTypes = {};

// Graph private methods
function wrapData (data, name) {
  return (data.name) ? {
    name: name ? name : data.name,
    id: Registry.get('data', data.name),
    status: data.status ? data.status : 'show',
    picker: data.picker ? data.picker : new Picker(data.name),
    points: data.points
  } : {
    name: name,
    id: Registry.get('data', name),
    status: 'show',
    picker: Picker.get(name) ? Picker.get(name) : new Picker(name),
    points: data
  }
}
function wrapDataObj(userData) {
  var data = [];
  if (typeof userData === 'object') {
    for (var key in userData)
      data.push(wrapData(userData[key], key));
  } else if (typeof userData === 'array') {
    for (var i = 0; i < userData.length; i++)
      data.push(wrapData(userData[i]));
  } else {
    throw 'Incorrect data type.'
  }
  return data;
}

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
 * @property {String} status          One of 'show', 'hidden', 'active', 
 * @property {Picker} picker          color picker.
 * @property {Array}  points          each type may have different definition.
 */

/**
 * Creates the parent class for Graph operations.
 * @param {String} type               Type of graph.
 * @param {Element|Stirng} container  Graph container, should be either string
 *                                    or HTMLElement.
 * @param {Object} data               Original data object.
 * @param {Object} [options]          Customized options object, including 
 *                                    title, etc.
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

$declare(Graph, {
  _graph: function(type, container, data, options) {
    // Initiate graph in graphInstances storage;
    this.id = Registry.get('graph');
    graphInstances[this.id] = this;
    this.type = type;
    // Container Element;
    this.container = container instanceof HTMLElement
        ? container
        : document.querySelector(container);
    // Parameters and Data
    if (graphTypes[type].__multidataset === false)
      this.data = data;
    else
      this.data = wrapDataObj(data);
    this._params(options);
    // SVG Element;
    this.svg = this._createSVG();
    // CSS Style Sheet;
    var styleSheet = document.head.appendChild(document.createElement('style'));
    styleSheet.type = 'text/css';
    this.css = document.styleSheets[document.styleSheets.length-1];
    // Actions;
    this.actions = (options.actions) ? graphTypes[type]._actions(options) : {};
    // Render
    this.render();
    this.setStyle();
    // Insert
    this.container.appendChild(this.svg);
  },
  _params: function(options) {
    // Title
    this.canvasSize = this.container.getSize();
    this.title = options.title ? options.title :
      graphTypes[this.type].__title + ' ' + graphTypes[this.type].__sequence++;
    if (this.__proto__._graphParams instanceof Function)
      this._graphParams(options);
  },
  _resize: function(canvasSize) {
    // Size Matters
    this.canvasSize = canvasSize;
    this._sizeParams();
    // Remove Previous
    this.container.removeChild(this.svg);
    // Render
    this.svg = this._createSVG();
    this.render();
    if (graphTypes[this.type].__multidataset) {
      this.data.forEach(function(el) {
        if (el.status === 'hidden') {
          el.g.hide();
        } else if (el.status === 'active') {
          el.g.addClass('ACTIVE');
        }
      });
    }
    this.container.appendChild(this.svg);
  },
  _createSVG: function() {
    var svg = document.createElementNS(kSvgNS, 'svg');
    svg.setAttributes({
      'version': '1.1',
      'width': this.canvasSize.w,
      'height': this.canvasSize.h,
      'id': this.id,
      'class': this.type
    });
    return svg;
  },
  _setCSSRule: function(innerSelector, style) {
    this.css.appendRule('#' + this.id + ' ' + innerSelector, style);
  },
  _setCSSRules: function(rules) {
    if (rules instanceof Array)
      for (var i = 0; i < rules.length; i++)
        this._setCSSRule(rules[i].selector, rules[i].style);
    else
      for (var selector in rules)
        this._setCSSRule(selector, rules[selector]);
  },
  showSeries: function(name) {
    if (graphTypes[this.type].__multidataset === false)
      return;
    this.data.forEach(function(el) {
      if (el.name === name) {
        if (el.status === 'hidden')
          el.g.addClass('HIDE-animation', 300).show();
        else if (el.status === 'preview')
          el.g.removeClass('PREVIEW');
        el.status = 'show';
      }
    });
  },
  hideSeries: function(name) {
    if (graphTypes[this.type].__multidataset === false)
      return;
    this.data.forEach(function(el) {
      if (el.name === name) {
        el.g.addClass('HIDE-animation', 300);
        setTimeout(function(){
          el.g.hide();
        }, 300);
        el.status = 'hidden';
      }
    });
  },
  highlightSeries: function(name, highlight) {
    if (graphTypes[this.type].__multidataset === false)
      return;
    this.data.forEach(function(el) {
      if (el.name === name) {
        if (highlight && el.status === 'show') {
          el.g.addClass('ACTIVE');
          el.status = 'highlight';
        } else if (!highlight) {
          el.g.removeClass('ACTIVE');
          el.status = 'show';
        }
      }
    });
  },
  previewSeries: function(name, preview) {
    if (graphTypes[this.type].__multidataset === false)
      return;
    this.data.forEach(function(el) {
      if (el.name === name) {
        if (preview && el.status === 'hidden') {
          el.g.addClass('HIDE-animation', 300).addClass('PREVIEW').show();
          el.status = 'preview';
        } else if ((!preview) && el.status === 'preview') {
          el.g.addClass('HIDE-animation', 300)
          setTimeout(function(){
            el.g.removeClass('PREVIEW').hide();
          }, 300);
          el.status = 'hidden';
        }
      }
    });
  },
  toggleSeries: function(name) {
    if (graphTypes[this.type].__multidataset === false)
      return;
    this.data.forEach(function(el) {
      if (el.name === name && el.status === 'show') {
        el.g.addClass('HIDE-animation', 300);
        setTimeout(function(){
          el.g.hide();
        }, 300);
        el.status = 'hidden';
      } else if (el.name === name) {
        if (el.status === 'hidden')
          el.g.addClass('HIDE-animation', 300).show();
        else if (el.status === 'preview')
          el.g.removeClass('PREVIEW');
        el.status = 'show';
      }
    });
  },
  addSeries: function(name, data) {
    var seriesData = wrapData(data, name);
    this.data.push(seriesData);
    this.renderData(seriesData);
  },
  removeSeries: function(name) {
    for (var i = 0; i < this.data.length; i ++)
      if (this.data[i].name === name) {
        var self = this;
        this.data[i].g.addClass('HIDE-animation');
        setTimeout(function(){
          self.svg.removeChild(self.data[i].g);
          self.data.splice(i, 1);
        },300);
        break;
      }
  },
  registerActions: function(selectorAll, type, listener, eventCapture) {
    [].slice.call(document.querySelectorAll('#' + this.id + ' ' + selectorAll))
      .forEach(function(el){
        el.addClass('action-registered');
        el.addEventListener(type, listener, eventCapture);
      });
  },
  refresh: function() {
    this._resize(this.container.getSize());
  },
  resize: function(canvasSize) {
    this._resize(canvasSize);
  },
  dispose: function() {
    this.svg.parentNode.removeChild(this.svg);
  }
});

/** 
 * @typedef GraphType
 * @type {GraphTypeInstance}
 * @property {String} __type          Registered type string for Graph
 * @property {String} __title         Default title of graph
 */

/**
 * @typedef GraphType.prototype
 * @type {GraphTypeInstance.prototype}
 * @property {Function} _graphParams  Generates graph parameters and stores in 
 *                                    this.params
 * @property {Function} _sizeParams   Generates or renew size parameters.
 * @property {Function} render        Render the entire graph.
 * @property {Function} setStyle      Set style for different states.
 * @property {Function} renderData    Render a new piece of data
 */

function GraphType() {}

$define(GraphType, {
  register: function(Type) {
    if (!(Type.prototype._graphParams instanceof Function && 
          Type.prototype._sizeParams instanceof Function))
      throw 'Missing required graph methods for Type: ' + Type;
    graphTypes[Type.__type] = Type;
    graphTypes[Type.__type].__sequence = 1;
  },
  unregister: function(Type) {
    delete types[Type.__type];
  }
})

function allGraph() {}

$define(allGraph, {
  _refresh: function() {
    for (var key in graphInstances)
      graphInstances[key].refresh();
  },
  showSeries: function(name) {
    for (var key in graphInstances)
      graphInstances[key].showSeries(name);
  },
  hideSeries: function(name) {
    for (var key in graphInstances)
      graphInstances[key].hideSeries(name);
  },
  highlightSeries: function(name, highlight) {
    for (var key in graphInstances)
      graphInstances[key].highlightSeries(name, highlight);
  },
  previewSeries: function(name, preview) {
    for (var key in graphInstances)
      graphInstances[key].previewSeries(name, preview);
  },
  toggleSeries: function(name, preview) {
    for (var key in graphInstances)
      graphInstances[key].toggleSeries(name, preview);
  },
  dispose: function() {
    for (var key in graphInstances) {
      graphInstances[key].dispose();
      delete graphInstances[key];
    }
  },
  get automaticResize() {
    return allGraph._automaticResizeSetting;
  },
  set automaticResize(refresh) {
    if (allGraph._automaticResizeSetting !== refresh) {
      if (refresh) window.addEventListener('resize', allGraph._refresh, false);
      else window.removeEventListener('resize', allGraph._refresh, false);
      allGraph._automaticResizeSetting = refresh;
    }
  },
  _automaticResizeSetting: true
})

window.addEventListener('resize', allGraph._refresh, false);


$define(window, {
  Graph: Graph,
  allGraph: allGraph,
  GraphType: GraphType
});

})();
(function(){
// Constants
var kSvgNS = 'http://www.w3.org/2000/svg';
var kGraphName = 'radar';
var kGraphTitle = 'Radar Chart';

function getDataBounds(data, userOptions) {
  var upperValue = Number.MIN_VALUE;
  var lowerValue = Number.MAX_VALUE;
  var bounds;
  for (var i = 0; i < data.length; i++) {
    for (var key in data[i].points) {
      if (data[i].points[key] > upperValue)
        upperValue = data[i].points[key];
      if (data[i].points[key] < lowerValue)
        lowerValue = data[i].points[key];
    }
  }
  bounds = {
    upperBound: userOptions.upperBound ? userOptions.upperBound : upperValue,
    lowerBound: userOptions.lowerBound ? userOptions.lowerBound : lowerValue
  };
  return $extend(bounds, {diff: bounds.upperBound - bounds.lowerBound});
}

function axisList(data, axisNames) {
  var axisList = [];
  for (var i = 0; i < data.length; i++) {
    axisList = Array.merge(axisList, Object.keys(data[i].points));
  }
  return axisList.map(function(axisName) {
    return {
      id: Registry.get('radar_axis', axisName),
      name: axisName,
      label: axisNames ? axisNames[axisName] ? axisNames[axisName] : axisName : axisName
    };
  });
}

function RadarChart(container, data, options) {
  this._graph(kGraphName, container, data, options ? options : {});
  return this;
}

/**
 * @typedef userOptions
 * @type {userOptions}
 * @property {String} title
 * @property {Number} fontSize
 * @property {Object} axisName
 * @property {String}
 */

$define(RadarChart, {
  __type: kGraphName,
  __title: kGraphTitle
});

$inherit(RadarChart, Graph, {
  _graphParams: function(options) {
    var params = {};
    // Axis
    params.axisList = axisList(this.data, options.axisName);
    params.axis = params.axisList.length;
    // Position
    params.center = {x: this.canvasSize.w/2, y: this.canvasSize.h/2};
    params.armLength = params.center.x - 20 > params.center.y
        ? params.center.y - 40
        : params.center.x - 60;
    // Label Colors
    params.labelColor = options.color ? new Color(options.color) :
        options.darkBackground ? new Color('rgb', 243, 243, 243) :
        new Color('rgb', 16, 16, 16);
    // Scale
    params.bounds = getDataBounds(this.data, options);
    params.stepLength = options.stepLength ? options.stepLength :
        options.steps ? params.bounds.diff / options.steps:
        params.bounds.diff / 5;
    params.steps = options.steps ? options.steps :
        ~~(params.bounds.diff / params.stepLength);
    params.calcArbLength = function(number) {
      return (number - params.bounds.lowerBound) / params.bounds.diff;
    };

    this.params = params;
  },
  _sizeParams: function() {
    this.params.center = {x: this.canvasSize.w/2, y: this.canvasSize.h/2};
    this.params.armLength = this.params.center.x - 20 > this.params.center.y
        ? this.params.center.y - 40
        : this.params.center.x - 60;
  },
  render: function() {
    // Set Title
    var title = document.createElementNS(kSvgNS, 'title');
    title.setTextValue(this.title);
    this.svg.appendChild(title);
    // Render Axis
    this.renderBase();
    for (var i = this.data.length - 1; i >= 0; i--) {
      this.renderData(this.data[i]);
    }
  },
  setStyle: function() {
    this._setCSSRules([{
      selector: 'path.axis',
      style: {
        stroke: this.params.labelColor.getColor('rgba', 0.8),
        strokeWidth: '2px',
        fill: 'none'
      }
    },{
      selector: 'path.guide',
      style: {
        stroke: this.params.labelColor.getColor('rgba', 0.2),
        fill: 'none'
      }
    }]);
    for (var i = this.data.length - 1; i >= 0; i--) {
      this._setCSSRules([{
        selector: 'circle.' + this.data[i].id,
        style: {
          stroke: this.data[i].picker.darkColor,
          strokeWidth: '2px',
          fill: this.data[i].picker.lightColor
        }
      },{
        selector: 'path.' + this.data[i].id,
        style: {
          stroke: this.data[i].picker.mainColor,
          strokeWidth: '2px',
          fill: this.data[i].picker.light.getColor('rgba', 0.2)
        }
      },{
        selector: 'g.' + this.data[i].id + ':hover path, g.' + this.data[i].id + '.ACTIVE path',
        style: {
          fill: this.data[i].picker.lightColor
        }
      }]);
    }
  },
  renderBase: function() {
    var center = this.params.center;
    var axis = this.params.axis;
    var steps = this.params.steps;
    var armLength = this.params.armLength;

    // Render axis.
    var gAxis = document.createElementNS(kSvgNS, 'g');
    for (var i = 0; i < axis; i++) {
      var path = document.createElementNS(kSvgNS, 'path');
      path.pathSegList.initialize(
        path.createSVGPathSegMovetoAbs(center.x, center.y));
      path.pathSegList.appendItem(path.createSVGPathSegLinetoRel(
        armLength * Math.sin(Math.PI + i * 2*Math.PI / axis), 
        armLength * Math.cos(Math.PI + i * 2*Math.PI / axis)));
      path.addClass('axis').addClass(this.params.axisList[i].id);
      gAxis.appendChild(path);
    }
    gAxis.addClass('axis');
    this.svg.appendChild(gAxis);

    // Render guide
    var gGuide = document.createElementNS(kSvgNS, 'g');
    for (var j = 0; j < steps; j++) {
      var path = document.createElementNS(kSvgNS, 'path');
      path.pathSegList.initialize(path.createSVGPathSegMovetoAbs(
        center.x,
        center.y - armLength * (j+1)/steps));
      for (var i = 1; i < axis; i++) {
        path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(
          center.x + armLength * Math.sin(i * 2*Math.PI / axis) * (j+1)/steps, 
          center.y - armLength * Math.cos(i * 2*Math.PI / axis) * (j+1)/steps));
      }
      path.pathSegList.appendItem(path.createSVGPathSegClosePath());
      path.addClass('guide');
      gGuide.appendChild(path);
    }
    gGuide.addClass('guide');
    this.svg.appendChild(gGuide);

    // Render label
    var gLabel = document.createElementNS(kSvgNS, 'g');
    for (var i = 0; i < this.params.axisList.length; i++) {
      var label = document.createElementNS(kSvgNS, 'text');
      label.setAttributesNS(null, {
        x: center.x + (armLength + 12) * Math.sin(i * 2*Math.PI / axis),
        y: center.y - (armLength + 12) * Math.cos(i * 2*Math.PI / axis)
      });
      label.setTextValue(this.params.axisList[i].label);
      label.setAttributeNS(null, 'text-anchor',
          (i / axis === 0.5 || i === 0) ? 'middle' :
          (i / axis > 0.5) ? 'end' : 'start');
      label.addClass(this.params.axisList[i].id);
      gLabel.appendChild(label);
    }
    gLabel.addClass('label');
    this.svg.appendChild(gLabel);
  },
  renderData: function(data) {
    var center = this.params.center;
    var axisList = this.params.axisList;
    var axis = this.params.axis;
    var armLength = this.params.armLength;

    var initialized = false;
    var gData = document.createElementNS(kSvgNS, 'g');

    var path = document.createElementNS(kSvgNS, 'path');
    for (var i = 0; i < axis; i++) {
      if (!axisList[i].name in data)
        continue;
      var arbLenth = this.params.calcArbLength(data.points[axisList[i].name]);
      var dataPoint = {
        x: center.x + arbLenth * armLength * Math.sin(i * 2*Math.PI / axis),
        y: center.y - arbLenth * armLength * Math.cos(i * 2*Math.PI / axis)
      }
      if (initialized) {
        path.pathSegList.appendItem(
          path.createSVGPathSegLinetoAbs(dataPoint.x, dataPoint.y));
      } else {
        path.pathSegList.initialize(
          path.createSVGPathSegMovetoAbs(dataPoint.x, dataPoint.y));
        initialized = true;
      }

      var dot = document.createElementNS(kSvgNS, 'circle');
      dot.setAttributesNS(null, {
        cx: dataPoint.x,
        cy: dataPoint.y,
        r: 4});
      dot.addClass(data.id);
      gData.appendChild(dot);
    }
    path.pathSegList.appendItem(path.createSVGPathSegClosePath());
    path.addClass('line').addClass(data.id);
    gData.addClass(data.id);
    gData.insertBefore(path, gData.firstChild);

    data.g = gData;
    this.svg.appendChild(gData);
  }
});

GraphType.register(RadarChart);

$define(window, {
  RadarChart: RadarChart
});

})();
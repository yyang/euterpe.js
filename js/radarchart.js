(function(){
// Constants
var kSvgNS = 'http://www.w3.org/2000/svg';
var kGraphName = 'radar';
var kGraphTitle = 'Radar Chart';
var graphSequence = 1;

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
  _options: function(graphObj, userOptions) {
    var options = {};
    // Title
    options.title = userOptions.title ? userOptions.title :
        kGraphTitle + ' ' + graphSequence++;
    // Axis
    options.axisList = axisList(graphObj.data, userOptions.axisName);
    options.axis = options.axisList.length;
    // Position
    options.center = {x: graphObj.canvasSize.w/2, y: graphObj.canvasSize.h/2};
    options.armLength = options.center.x - 20 > options.center.y
        ? options.center.y - 40
        : options.center.x - 60;
    // Label Colors
    options.labelColor = userOptions.color ? new Color(userOptions.color) :
        userOptions.darkBackground ? new Color('rgb', 243, 243, 243) :
        new Color('rgb', 16, 16, 16);
    // Scale
    options.bounds = getDataBounds(graphObj.data, userOptions);
    options.stepLength = userOptions.stepLength ? userOptions.stepLength :
        userOptions.steps ? options.bounds.diff / userOptions.steps:
        options.bounds.diff / 5;
    options.steps = userOptions.steps ? userOptions.steps :
        ~~(options.bounds.diff / options.stepLength);
    options.calcArbLength = function(number) {
      return (number - options.bounds.lowerBound) / options.bounds.diff;
    };

    return options;
  },
  _actions: function(actions) {

  }
});

$inherit(RadarChart, Graph, {
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
  renderBase: function() {
    var center = this.options.center;
    var axis = this.options.axis;
    var steps = this.options.steps;
    var armLength = this.options.armLength;

    // Render axis.
    var gAxis = document.createElementNS(kSvgNS, 'g');
    for (var i = 0; i < axis; i++) {
      var path = document.createElementNS(kSvgNS, 'path');
      path.pathSegList.initialize(
        path.createSVGPathSegMovetoAbs(center.x, center.y));
      path.pathSegList.appendItem(path.createSVGPathSegLinetoRel(
        armLength * Math.sin(Math.PI + i * 2*Math.PI / axis), 
        armLength * Math.cos(Math.PI + i * 2*Math.PI / axis)));
      path.addClass('axis').addClass(this.options.axisList[i].id);
      gAxis.appendChild(path);
    }
    gAxis.addClass('axis');
    this.svg.appendChild(gAxis);
    this._setCSSRule('path.axis', {
      stroke: this.options.labelColor.getColor('rgba', 0.8),
      strokeWidth: '2px',
      fill: 'none'
    });

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
    this._setCSSRule('path.guide', {
      stroke: this.options.labelColor.getColor('rgba', 0.2),
      fill: 'none'
    });

    // Render label
    var gLabel = document.createElementNS(kSvgNS, 'g');
    for (var i = 0; i < this.options.axisList.length; i++) {
      var label = document.createElementNS(kSvgNS, 'text');
      label.setAttributesNS(null, {
        x: center.x + armLength * Math.sin(i * 2*Math.PI / axis) * 1.1,
        y: center.y - armLength * Math.cos(i * 2*Math.PI / axis) * 1.1
      });
      label.setTextValue(this.options.axisList[i].label);
      label.setAttributeNS(null, 'text-anchor',
          (i / axis === 0.5 || i === 0) ? 'middle' :
          (i / axis > 0.5) ? 'end' : 'start');
      label.addClass(this.options.axisList[i].id);
      gLabel.appendChild(label);
    }
    gLabel.addClass('label');
    this.svg.appendChild(gLabel);
  },
  renderData: function(data) {
    var center = this.options.center;
    var axisList = this.options.axisList;
    var axis = axisList.length;
    var armLength = this.options.armLength;

    var initialized = false;
    var gData = document.createElementNS(kSvgNS, 'g');

    var path = document.createElementNS(kSvgNS, 'path');
    for (var i = 0; i < axis; i++) {
      if (!axisList[i].name in data)
        continue;
      var arbLenth = this.options.calcArbLength(data.points[axisList[i].name]);
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

    this._setCSSRules([{
      selector: 'circle.' + data.id,
      style: {
        stroke: data.picker.darkColor,
        strokeWidth: '2px',
        fill: data.picker.lightColor
      }
    },{
      selector: 'path.' + data.id,
      style: {
        stroke: data.picker.mainColor,
        strokeWidth: '2px',
        fill: data.picker.light.getColor('rgba', 0.2)
      }
    },{
      selector: 'g.' + data.id + ':hover path, g.' + data.id + '.active path',
      style: {
        fill: data.picker.lightColor
      }
    }]);

    this.svg.appendChild(gData);
  }
});

GraphType.register(RadarChart);

$define(window, {
  RadarChart: RadarChart
});

})();
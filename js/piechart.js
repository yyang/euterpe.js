// Constants
var kSvgNS = 'http://www.w3.org/2000/svg';

// Basic Chart
var charts = [];

function Chart(type, data, container, canvasSize) {

  this.svg = container.insertBefore(document.createElementNS(kSvgNS, 'svg'), null);
  this.svg.setAttribute('version', '1.1');
  this.svg.setAttribute('width', canvasSize.width);
  this.svg.setAttribute('height', canvasSize.height);
  this.canvasSize = canvasSize;
  return this;
}

$declare(Chart, {
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


function RadarChart(chart) {
  this.chart = chart;
  this.center = {x: chart.canvasSize.width / 2, y: chart.canvasSize.height / 2};
  this.axisLength = this.center.x > this.center.y ? this.center.y - 100 : this.center.x - 100;
  this.renderAxes(5);
  this.renderLabel();
  this.renderData();
  return this;
}

$declare(RadarChart, {
  renderAxes: function(axes) {
    for (var i = 0; i < axes; i++) {
      var path = document.createElementNS(kSvgNS, 'path');
      path.pathSegList.initialize(path.createSVGPathSegMovetoAbs(this.center.x, this.center.y));
      path.pathSegList.appendItem(path.createSVGPathSegLinetoRel(
        this.axisLength * Math.sin(Math.PI + i * 2*Math.PI / axes), 
        this.axisLength * Math.cos(Math.PI + i * 2*Math.PI / axes)));
      path.addClass('axis');
      this.chart.svg.insertBefore(path, this.chart.svg.firstChild);
    }
    for (var j = 0; j < 5; j++) {
      var path = document.createElementNS(kSvgNS, 'path');
      path.pathSegList.initialize(path.createSVGPathSegMovetoAbs(this.center.x, this.center.y - this.axisLength * (j+1)/5));
      for (var i = 1; i < axes; i++) {
        path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(
          this.center.x + this.axisLength * Math.sin(i * 2*Math.PI / axes) * (j+1)/5, 
          this.center.y - this.axisLength * Math.cos(i * 2*Math.PI / axes) * (j+1)/5));
      }
      path.pathSegList.appendItem(path.createSVGPathSegClosePath());
      path.addClass('line');
      this.chart.svg.appendChild(path);
    }
  },
  renderLabel: function(labels) {
    labels = ['GENEROSITY','ETHICAL','INTEGRITY','HUMANE','LOVE FOR HK'];
    for (var i = 0; i < labels.length; i++) {
      var label = document.createElementNS(kSvgNS, 'text');
      label.setAttributeNS(null,"x",this.center.x + this.axisLength * Math.sin(i * 2*Math.PI / labels.length) * 1.1 );
      label.setAttributeNS(null,"y",this.center.y - this.axisLength * Math.cos(i * 2*Math.PI / labels.length) * 1.1 ); 
      //label.setAttributeNS(null,"font-size","100");

      label.appendChild(document.createTextNode(labels[i]));
      this.chart.svg.appendChild(label);
    }
  },
  renderData: function(data) {
    data = {"generosity": -1.5,"ethical": 1.75,"integrity": 3.5,"humane": 0,"lovehk": 1.5};
    var axes = 5;
    var keys = Object.keys(data);
    var group = document.createElementNS(kSvgNS, 'g')
    var path = document.createElementNS(kSvgNS, 'path');
    for (var i = 0; i < keys.length; i++) {
      (i == 0) ?
        path.pathSegList.initialize(path.createSVGPathSegMovetoAbs(
          this.center.x + this.axisLength * Math.sin(i * 2*Math.PI / axes) * (data[keys[i]]+7.5)/12.5, 
          this.center.y - this.axisLength * Math.cos(i * 2*Math.PI / axes) * (data[keys[i]]+7.5)/12.5))
        :
        path.pathSegList.appendItem(path.createSVGPathSegLinetoAbs(
          this.center.x + this.axisLength * Math.sin(i * 2*Math.PI / axes) * (data[keys[i]]+7.5)/12.5, 
          this.center.y - this.axisLength * Math.cos(i * 2*Math.PI / axes) * (data[keys[i]]+7.5)/12.5));
    }
    path.pathSegList.appendItem(path.createSVGPathSegClosePath());
    path.addClass('line');
    group.appendChild(path);
    for (var i = 0; i < keys.length; i++) {
      var dot = document.createElementNS(kSvgNS, 'circle');
      dot.setAttributeNS(null, 'cx', this.center.x + this.axisLength * Math.sin(i * 2*Math.PI / axes) * (data[keys[i]]+7.5)/12.5);
      dot.setAttributeNS(null, 'cy', this.center.y - this.axisLength * Math.cos(i * 2*Math.PI / axes) * (data[keys[i]]+7.5)/12.5);
      dot.setAttributeNS(null, 'r', 10);
      group.appendChild(dot);
    }
    this.chart.svg.appendChild(group);
  }
});
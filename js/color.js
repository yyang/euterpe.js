// Color Controller;

(function(){

var rP = 0.299, gP = 0.587, bP = 0.114;

/* HSP Color Model integraded according to Darel Rex Finley.
 * Ref: http://alienryderflex.com/hsp.html
 * In this method, we assume that 0 <= h <= 360, 0 <= s,p <= 1.
 * HSL and HSV codes are interaged according to Axon Flux.
 * Ref: http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 * Modified so that the code satisfies 0 <= h <= 360.
 */

function fromHSVtoRGB(h, s, v) {
  var r, g, b;
  var i = ~~(h / 60);
  var f = h / 60 - i;

  switch (i) {
    case 0:
      r = v;
      g = v * (1 - s * (1 - f));
      b = v * (1 - s);
      break;
    case 1:
      r = v * (1 - s * f);
      g = v;
      b = v * (1 - s);
      break;
    case 2:
      r = v * (1 - s);
      g = v;
      b = v * (1 - s * (1 - f));
      break;
    case 3:
      r = v * (1 - s);
      g = v * (1 - s * f);
      b = v;
      break;
    case 4:
      r = v * (1 - s * (1 - f));
      g = v * (1 - s);
      b = v;
      break;
    case 5:
      r = v;
      g = v * (1 - s);
      b = v * (1 - s * f);
      break;
  }

  return {
    r: r > 1 ? 255 : ~~(r * 255),
    g: g > 1 ? 255 : ~~(g * 255),
    b: b > 1 ? 255 : ~~(b * 255)
  }
}

function fromHSPtoRGB(h, s, p) {
  var r, g, b;
  var i = (s === 1) ? ~~(h / 60) + 6 : ~~(h / 60), gH = h / 360;
  var minOverMax = 1 - s, part;

  switch (i) {
    case 0:
      gH = 6 * (gH - 0 / 6); 
      part = 1 + gH * (1 / minOverMax - 1);
      b = p / Math.sqrt(rP / minOverMax / minOverMax + gP * part * part + bP);
      r = b / minOverMax; 
      g = b + gH * (r - b);
      break;
    case 1:
      gH =  6 * (-gH + 2 / 6); 
      part = 1 + gH * (1 / minOverMax - 1);
      b = p / Math.sqrt(gP / minOverMax / minOverMax + rP * part * part + bP);
      g = b / minOverMax;
      r = b + gH * (g - b);
      break;
    case 2:
      gH =  6 * (gH - 2 / 6);
      part = 1 + gH * (1 / minOverMax - 1);
      r = p / Math.sqrt(gP / minOverMax / minOverMax + bP * part * part + rP);
      g = r / minOverMax;
      b = r + gH * (g - r);
      break;
    case 3:
      gH =  6 * (-gH + 4 / 6);
      part = 1 + gH * (1 / minOverMax - 1);
      r = p / Math.sqrt(bP / minOverMax / minOverMax + gP * part * part + rP);
      b = r / minOverMax;
      g = r + gH * (b - r);
      break;
    case 4:
      gH =  6 * (gH - 4 / 6);
      part = 1 + gH * (1 / minOverMax - 1);
      g = p / Math.sqrt(bP / minOverMax / minOverMax + rP * part * part + gP);
      b = g / minOverMax;
      r = g + gH * (b - g);
      break;
    case 5:
      gH =  6 * (-gH + 6 / 6); part = 1 + gH * (1 / minOverMax - 1);
      g = p / Math.sqrt(rP / minOverMax / minOverMax + bP * part * part + gP);
      r = g / minOverMax;
      b = g + gH * (r - g);
      break;
    case 6:
      gH = 6 * (gH - 0 / 6);
      r = Math.sqrt(p * p / (rP + gP * gH * gH));
      g = r * gH;
      b = 0;
      break;
    case 7:
      gH = 6 * (-gH + 2 / 6);
      g = Math.sqrt(p * p / (gP + rP * gH * gH));
      r = g * gH;
      b = 0;
      break;
    case 8:
      gH = 6 * (gH - 2 / 6);
      g = Math.sqrt(p * p / (gP + bP * gH * gH));
      b = g * gH;
      r = 0;
      break;
    case 9:
      gH = 6 * (-gH + 4 / 6);
      b = Math.sqrt(p * p / (bP + gP * gH * gH));
      g = b * gH;
      r = 0;
      break;
    case 10:
      gH = 6 * (gH - 4 / 6);
      b = Math.sqrt(p * p / (bP + rP * gH * gH));
      r = b * gH;
      g = 0;
      break;
    case 11:
      gH = 6 * (-gH + 6 / 6);
      r = Math.sqrt(p * p / (rP + bP * gH * gH));
      b = r * gH;
      g = 0;
      break;
  }

  return {
    r: r > 1 ? 255 : ~~(r * 255),
    g: g > 1 ? 255 : ~~(g * 255),
    b: b > 1 ? 255 : ~~(b * 255)
  }
}

function fromHSLtoRGB(h, s, l) {
  var r, g, b;

  if(s == 0){
    r = g = b = l;
  }else{
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 120);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 120);
  }

  return {
    r: r > 1 ? 255 : ~~(r * 255),
    g: g > 1 ? 255 : ~~(g * 255),
    b: b > 1 ? 255 : ~~(b * 255)
  }

  function hue2rgb(p, q, t){
    t = (t + 360) % 360;
    if (t < 60) {
      return p + (q - p) * t / 60;
    } else if (t < 180) {
      return q;
    } else if (t < 240) {
      return p + (q - p) * (240 - t) / 60;
    } else {
      return p;
    }
  }
}

function fromRGBtoHSP(colorObj) {
  var r = colorObj.r / 255, g = colorObj.g / 255, b = colorObj.b / 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s;

  if(max === min){
    h = 0;
    s = 0;
  }else{
    s = 1 - min / max;
    switch(max){
      case r:
        h = (g - b) / (max - min) + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / (max - min) + 2;
        break;
      case b:
        h = (r - g) / (max - min) + 4;
        break;
    }
  }

  return {
    h: ~~(h * 60),
    s: s,
    p: Math.sqrt(r*r*rP + g*g*gP + b*b*bP),
  };
}

function fromRGBtoHSL(colorObj) {
  var r = colorObj.r / 255, g = colorObj.g / 255, b = colorObj.b / 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max === min){
    h = s = 0; // achromatic
  }else{
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case
        g: h = (b - r) / d + 2;
        break;
      case
        b: h = (r - g) / d + 4;
        break;
    }
  }

  return {
    h: ~~(h * 60),
    s: s,
    l: l,
  };
}

function fromRGBtoHSV(colorObj) {
  var r = colorObj.r / 255, g = colorObj.g / 255, b = colorObj.b / 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  if(max === min){
    h = 0;
    s = 0;
  }else{
    s = 1 - min / max;
    switch(max){
      case r:
        h = (g - b) / (max - min) + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / (max - min) + 2;
        break;
      case b:
        h = (r - g) / (max - min) + 4;
        break;
    }
  }

  return {
    h: ~~(h * 60),
    s: s,
    v: v,
  };
}

function parseColor(colorString) {
  var colorArr = []
  colorArr.push(/^[a-zA-Z]+/.exec(colorString));
  colorArr.concat(/\((.*?)\)/.exec(colorString)[1].split(',').map(function(el){
      return parseFloat(el, 10);
  }));
  if (colorArr.length === 4) {
    return colorArr;
  } else {
    throw 'Invalid color.';
  }
}

function getHexString(rgbColorObj) {
  function toHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
  return toHex(rgbColorObj.r) + toHex(rgbColorObj.g) + toHex(rgbColorObj.b);
}

function getColorString(mode, color, alpha) {
  var colorDigits = [];
  for (var i = 0; i < mode.length; i++) {
    if (['s','l','v','p'].indexOf(mode[i]) > 0) {
      colorDigits.push(~~(color[mode[i]] * 100) + '%');
    } else if (mode[i] === 'a') {
      if (alpha >= 0 && alpha <= 1) {
        colorDigits.push(alpha);
      } else {
        throw 'Invalid alpha value';
      }
    } else {
      colorDigits.push(color[mode[i]]);
    }
  }
  return mode + '(' + colorDigits.toString() + ')';
}

function Color() {
  switch (arguments.length) {
    case 0:
      throw 'Color has not been specified';
    case 1:
      var initArr = parseColor(arguments[0]);
      this.initialize(initArr);
      break;
    case 4:
      var initArr = [].slice.call(arguments);
      this.initialize(initArr);
      break;
    default:
      throw 'Invalid number of arguments';
  }
  return this;
}

$declare(Color, {
  getColor: function() {
    if (arguments.length === 0) {
      return getColorString('rgb', this.rgb);
    }
    var mode = arguments[0];
    switch (mode) {
      case 'hex':
        return getHexString(this.rgb);
      case 'hexString':
        return '#' + getHexString(this.rgb);
      case 'rgb':
        return this.rgb;
      case 'hsp':
        return this.hsp;
      case 'hsv':
        return fromRGBtoHSV(this.rgb);
      case 'hsl':
        return fromRGBtoHSL(this.rgb);
      case 'rgbString':
        return getColorString('rgb', this.rgb);
      case 'hslString':
        return getColorString('hsl', fromRGBtoHSL(this.rgb));
      case 'rgba':
        return getColorString('rgba', this.rgb, arguments[1]);
      case 'hsla':
        return getColorString('hsla', fromRGBtoHSL(this.rgb), arguments[1]);
    }
  },
  lighten: function(amount) {
    return new Color('hsp', this.hsp.h, this.hsp.s, this.hsp.p - amount);
  },
  darken: function(amount) {
    return new Color('hsp', this.hsp.h, this.hsp.s, this.hsp.p + amount);
  },
  desaturate: function(amount) {
    return new Color('hsp', this.hsp.h, this.hsp.s - amount, this.hsp.p);
  },
  saturate: function(amount) {
    return new Color('hsp', this.hsp.h, this.hsp.s + amount, this.hsp.p);
  },
  greyscale: function() {
    return new Color('hsp', 0, 0, this.hsp.p);
  },
  initialize: function(initArr) {
    switch (initArr[0]) {
      case 'rgb':
        this.rgb = {r: initArr[1], g: initArr[2], b: initArr[3]};
        this.hsp = fromRGBtoHSP(this.rgb);
        break;
      case 'hsp':
        this.hsp = {h: initArr[1], s: initArr[2], p: initArr[3]};
        this.rgb = fromHSPtoRGB(this.hsp.h, this.hsp.s, this.hsp.p);
        break;
      case 'hsv':
        this.rgb = fromHSVtoRGB(initArr[1], initArr[2], initArr[3]);
        this.hsp = fromRGBtoHSP(this.rgb);
        break;
      case 'hsl':
        this.rgb = fromHSLtoRGB(initArr[1], initArr[2], initArr[3]);
        this.hsp = fromRGBtoHSP(this.rgb);
        break;
      default: 
        throw 'Invalid color mode.'
    }
  }
});

$explict('Color', Color);

})();

// Picker Controller;

(function(){

var step = 53, currentHue = 21;
var pickers = [];
var pickerId = 0;

function Picker() {
  // Store it in an array.
  this.id = pickerId;
  pickers[pickerId] = this;
  pickerId ++;

  this.name = arguments[0] ? arguments[0] : '';
  if (arguments[1]) {
    this.hue = arguments[1];
  } else {
    this.hue = currentHue;
    currentHue += step;
  }
  this.calcColors();

  return this;
}

$declare(Picker, {
  calcColors: function() {
    this.dark = new Color('hsp', this.hue, 0.8, 0.5);
    this.main = new Color('hsp', this.hue, 0.9, 0.7);
    this.vivid = new Color('hsp', this.hue, 0.95,0.9);
    this.light = new Color('hsp', this.hue, 0.6, 1);
    this.darkColor = this.dark.getColor('rgba', 0.8);
    this.mainColor = this.main.getColor();
    this.vividColor = this.vivid.getColor();
    this.lightColor = this.light.getColor('rgba', 0.8);
  },
  shift: function(hue, direction) {
    if (arguments.length === 1) {
      direction = 'right';
    }
    switch (direction) {
      case true:
      case 'right':
      case 'forward':
        this.hue += hue;
        break;
      case false:
      case 'left':
      case 'backward':
        this.hue -= hue;
        break;
    }
    this.calcColors();
  }
})

$define(Picker, {
  get: function(name) {
    return pickers.filter(function(el) {
      return el.name === name;
    });
  },
  series: function(numbers, seriesName) {
    if (seriesName === undefined) {
      seriesName = 'colorSeries';
    }
    var pickerSeries = [];
    if (numbers < 7) {
      for (var i = 0; i < numbers; i++) {
        pickerSeries.push(new Picker(seriesName, 10 + 53 * i));
      }
    } else {
      for (var i = 0; i < numbers; i++) {
        pickerSeries.push(new Picker(seriesName, 10 + 29 * i));
      }
    }
    return pickerSeries;
  }
})

$explict('Picker', Picker);

})();
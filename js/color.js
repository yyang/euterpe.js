(function(){

var step = 0.157;
var sequence = 0;
var colors = [];
var rP = 0.299, gP = 0.587, bP = 0.114;

/* HSP Color Model integraded according to Darel Rex Finley.
 * Reference: http://alienryderflex.com/hsp.html
 * In this method, we assuem that 0 <= h,s,p <= 1.
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
      r = Math.sqrt(P * P / (rP + gP * gH * gH));
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

function fromRGBtoHSP(r, g, b) {
  r /= 255, g /= 255, b /= 255;
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

function fromRGBtoHSL(r, g, b) {
  r /= 255, g /= 255, b /= 255;
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

function fromRGBtoHSV(r, g, b) {
  r /= 255, g /= 255, b /= 255;
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

}

/* Provides those interfaces:
 * var color = new Color(name, )
 */

function Color() {
  if (arguments.length === 0) {
    throw 'Color has not been specified'
  } else (arguments.length === 1) {
    var pasedColor = parseColor(arguments[0]);
  } else (arguments.length === 4) {
    switch (arguments[0]) {

    }
  }
}

$declare(Color, {
  getColor: function() {
    if (arguments[0]) {

    } else {
      return rgbString;
    }
  }
})

})();
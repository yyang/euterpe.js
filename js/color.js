for (var j = 0; j < 10; j++) {

var colors = [];


  for (var i = 0; i < 10; i++) {
    colors.push(hspToRGB(0.1 * j + 0.01 * i,.9,.7));
  }



  var list = document.createElement('div');
  list.addClass('list');
  for (var i = 0; i < colors.length; i++) {
    var color = document.createElement('span');
    color.style.backgroundColor = 'rgba(' + colors[i].r + ',' + colors[i].g + ',' + colors[i].b + ',.8)'
    list.appendChild(color);
  }
  document.querySelector('body').appendChild(list);
}

/* HSP Color Model integraded according to Darel Rex Finley.
 * Reference: http://alienryderflex.com/hsp.html
 * In this method, we assuem that 0 <= h, s,p <= 1.
 */

function hspToRGB (h, s, p) {
  var rP = 0.299, gP = 0.587, bP = 0.114;
  var r, g, b;
  var i = (s === 1) ? Math.floor(h * 6) + 6 : Math.floor(h * 6);
  var minOverMax = 1 - s, part;

  switch (i) {
    case 0:
      h = 6 * (h - 0 / 6); 
      part = 1 + h * (1 / minOverMax - 1);
      b = p / Math.sqrt(rP / minOverMax / minOverMax + gP * part * part + bP);
      r = b / minOverMax; 
      g = b + h * (r - b);
      break;
    case 1:
      h =  6 * (-h + 2 / 6); 
      part = 1 + h * (1 / minOverMax - 1);
      b = p / Math.sqrt(gP / minOverMax / minOverMax + rP * part * part + bP);
      g = b / minOverMax;
      r = b + h * (g - b);
      break;
    case 2:
      h =  6 * (h - 2 / 6);
      part = 1 + h * (1 / minOverMax - 1);
      r = p / Math.sqrt(gP / minOverMax / minOverMax + bP * part * part + rP);
      g = r / minOverMax;
      b = r + h * (g - r);
      break;
    case 3:
      h =  6 * (-h + 4 / 6);
      part = 1 + h * (1 / minOverMax - 1);
      r = p / Math.sqrt(bP / minOverMax / minOverMax + gP * part * part + rP);
      b = r / minOverMax;
      g = r + h * (b - r);
      break;
    case 4:
      h =  6 * (h - 4 / 6);
      part = 1 + h * (1 / minOverMax - 1);
      g = p / Math.sqrt(bP / minOverMax / minOverMax + rP * part * part + gP);
      b = g / minOverMax;
      r = g + h * (b - g);
      break;
    case 5:
      h =  6 * (-h + 6 / 6); part = 1 + h * (1 / minOverMax - 1);
      g = p / Math.sqrt(rP / minOverMax / minOverMax + bP * part * part + gP);
      r = g / minOverMax;
      b = g + h * (r - g);
      break;
    case 6:
      h = 6 * (h - 0 / 6);
      r = Math.sqrt(P * P / (rP + gP * h * h));
      g = r * h;
      b = 0;
      break;
    case 7:
      h = 6 * (-h + 2 / 6);
      g = Math.sqrt(p * p / (gP + rP * h * h));
      r = g * h;
      b = 0;
      break;
    case 8:
      h = 6 * (h - 2 / 6);
      g = Math.sqrt(p * p / (gP + bP * h * h));
      b = g * h;
      r = 0;
      break;
    case 9:
      h = 6 * (-h + 4 / 6);
      b = Math.sqrt(p * p / (bP + gP * h * h));
      g = b * h;
      r = 0;
      break;
    case 10:
      h = 6 * (h - 4 / 6);
      b = Math.sqrt(p * p / (bP + rP * h * h));
      r = b * h;
      g = 0;
      break;
    case 11:
      h = 6 * (-h + 6 / 6);
      r = Math.sqrt(p * p / (rP + bP * h * h));
      b = r * h;
      g = 0;
      break;
  }

  return {
    r: r > 1 ? 255 : ~~(r * 255),
    g: g > 1 ? 255 : ~~(g * 255),
    b: b > 1 ? 255 : ~~(b * 255),
  }
}

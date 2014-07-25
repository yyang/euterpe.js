(function(){

/**
 * Add an array method.
 */

$define(Array, {
  merge: function(arr1, arr2) {
    var merged = arr1.concat(arr2);
    for (var i = 0; i < merged.length; i++) {
      for (var j=i+1; j < merged.length; j++) {
        if (merged[i] === merged[j])
          merged.splice(j--, 1);
      }
    }
    return merged;
  }
})

/**
 * Extends some useful features for Element.
 */

$define(Node.prototype, {
  ancestorOf: function(node, noself) {
    for (node = noself ? this.parentNode : node; node; node = node.parentNode)
      if (this === node) return true;
    return false;
  },
  setAttributes: function (attributes) {
    for (var key in attributes)
      this.setAttribute(key, attributes[key]);
    return this;
  },
  setAttributesNS: function (NS, attributes) {
    for (var key in attributes)
      this.setAttributeNS(NS, key, attributes[key]);
    return this;
  },
  setTextValue: function (value) {
    if (this.firstChild && this.firstChild.nodeType === 3) {
      this.firstChild.nodeValue = value;
      return this;
    } else {
      this.appendChild(document.createTextNode(value));
    }
    return this;
  },
});

/**
 * Redistributed from Apollo.js
 */

$define(Element.prototype, {
  setClass: function(cls, set) {
    return set ?
      this.addClass(cls) :
      this.removeClass(cls);
  },
  hide: function() {
    return this.addClass('HIDE');
  },
  show: function() {
    return this.removeClass('HIDE');
  },
  getSize: function() {
    return {
      w: this.offsetWidth,
      h: this.offsetHeight
    };
  },
  getPos: function() {
    var node = this, x = 0, y = 0;
    while (node.offsetParent) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return {
      x: x,
      y: y
    };
  }
});

/**
 * Element class operations, differentiated HTMLElement and SVGElement  
 * in order to comply with HTML and SVG standards.
 */

function hideClassAfterDuration(el, cls, duration) {
  var timers = el.getData('apolloTimers', true) || {};
  if (timers[cls])
    clearTimeout(timers[cls]);
  timers[cls] = setTimeout(function() {
    el.removeClass(cls);
  }, duration);
  el.setData('apolloTimers', timers, true);
}

$define(HTMLElement.prototype, document.documentElement.classList ? {
  addClass: function(cls, duration) {
    this.classList.add(cls);
    if (duration)
      hideClassAfterDuration(this, cls, duration);
    return this;
  },
  removeClass: function(cls) {
    this.classList.remove(cls);
    return this;
  },
  hasClass: function(cls) {
    return this.classList.contains(cls);
  },
  toggleClass: function(cls) {
    this.classList.toggle(cls);
    return this;
  }
} : {
  addClass: function(cls, duration) {
    if (!this.hasClass(cls))
      this.className += ' ' + cls;
    if (duration)
      hideClassAfterDuration(this, cls, duration);
    return this;
  },
  removeClass: function(cls) {
    this.className = this.className.replace(new RegExp('\\s*\\b' + cls + '\\b', 'g'), '');
    return this;
  },
  hasClass: function(cls) {
    return (new RegExp('\\b' + cls + '\\b')).test(this.className);
  },
  toggleClass: function(cls) {
    return this.hasClass(cls) ? this.removeClass(cls) : this.addClass(cls);
  }
});

$define(SVGElement.prototype, {
  addClass: function(cls, duration) {
    if (!this.hasClass(cls)) {
      if (this.getAttribute('class'))
        this.setAttribute('class', this.getAttribute('class') + ' ' + cls);
      else
        this.setAttribute('class', cls);
    }
    if (duration)
      hideClassAfterDuration(this, cls, duration);
    return this;
  },
  removeClass: function(cls) {
    if (this.hasClass(cls)) {
      if (this.getAttribute('class') === cls)
        this.removeAttribute('class')
      else
        this.setAttribute('class', this.getAttribute('class').replace(new RegExp('\\s*\\b' + cls + '\\b', 'g'), ''));
    }
    return this;
  },
  hasClass: function(cls) {
    return (new RegExp('\\b' + cls + '\\b')).test(this.getAttribute('class'));
  },
  toggleClass: function(cls) {
    return this.hasClass(cls) ? this.removeClass(cls) : this.addClass(cls);
  }
});

/**
 * Element data operations, differentiated HTMLElement and SVGElement  
 * in order to comply with HTML and SVG standards.
 */

function toDatasetName(name) {
  return 'data-' + name.replace(/[A-Z]/g, function(cap) {
    return '-' + cap.toLowerCase();
  });
}

$define(HTMLElement.prototype, document.documentElement.dataset ? {
  setData: function(name, value, json) {
    if (json)
      value = JSON.stringify(value);
    this.dataset[name] = value;
    return this;
  },
  getData: function(name, json) {
    var value = this.dataset[name];
    if (value && json)
      return JSON.parse(value);
    return value;
  },
  removeData: function(name) {
    delete this.dataset[name];
    return this;
  }
} : {
  setData: function(name, value, json) {
    if (json)
      value = JSON.stringify(value);
    this.setAttribute(toDatasetName(name), value);
    return this;
  },
  getData: function(name, json) {
    var value = this.getAttribute(toDatasetName(name)) || undefined;
    if (value && json)
      return JSON.parse(value);
    return value;
  },
  removeData: function(name) {
    this.removeAttribute(toDatasetName(name));
    return this;
  }
});

$define(SVGElement.prototype, {
  setData: function(name, value, json) {
    if (json)
      value = JSON.stringify(value);
    this.setAttribute(toDatasetName(name), value);
    return this;
  },
  getData: function(name, json) {
    var value = this.getAttribute(toDatasetName(name)) || undefined;
    if (value && json)
      return JSON.parse(value);
    return value;
  },
  removeData: function(name) {
    this.removeAttribute(toDatasetName(name));
    return this;
  }
});


/**
 * Redistributed from Apollo.js
 */

$define(CSSStyleSheet.prototype, {
  empty: function() {
    return this.cssRules.length === 0;
  },
  clear: function() {
    this.disabled = true;
    while (this.cssRules.length > 0)
      this.deleteRule(0);
    this.disabled = false;
  },
  setRules: function(rules) {
    this.disabled = true;
    for (var i = 0; i < rules.length; i++)
      this.appendRule(rules[i]);
    this.disabled = false;
  },
  appendRule: function(selector, style) {
    var idx = this.cssRules.length;
    if (this.insertRule)
      this.insertRule(selector + '{}', idx);
    else
      this.addRule(selector, ';');
    var rule = this.cssRules[idx];
    // console.log(rule);
    if (style)
      for (var name in style)
        rule.style[name] = style[name];
    return rule;
  }
});

})();
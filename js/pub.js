(function(){

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


// for shitting IE9.
$define(Element.prototype, document.documentElement.classList ? {
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


})();
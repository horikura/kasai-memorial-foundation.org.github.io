/* Cross-browser helpers: ES5-compatible, no external dependencies. */
(function (window, document) {
  'use strict';

  if (!String.prototype.trim) {
    String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); };
  }
  if (!Array.isArray) {
    Array.isArray = function (value) { return Object.prototype.toString.call(value) === '[object Array]'; };
  }
  if (!Date.now) {
    Date.now = function () { return new Date().getTime(); };
  }
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      var length = this.length >>> 0;
      var i = Number(fromIndex) || 0;
      if (i < 0) i = Math.max(0, length + i);
      for (; i < length; i++) if (i in this && this[i] === searchElement) return i;
      return -1;
    };
  }

  var ElementProto = window.Element && window.Element.prototype;
  if (ElementProto && !ElementProto.matches) {
    ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.webkitMatchesSelector || function (selector) {
      var nodes = (this.document || this.ownerDocument).querySelectorAll(selector);
      var i = nodes.length;
      while (i-- && nodes.item(i) !== this) {}
      return i > -1;
    };
  }
  if (ElementProto && !ElementProto.closest) {
    ElementProto.closest = function (selector) {
      var node = this;
      while (node && node.nodeType === 1) {
        if (node.matches(selector)) return node;
        node = node.parentElement || node.parentNode;
      }
      return null;
    };
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
      return window.setTimeout(function () { callback(Date.now()); }, 16);
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.clearTimeout;
  }

  if (!window.matchMedia) {
    window.matchMedia = function (query) {
      return {
        matches: false,
        media: query,
        addListener: function () {},
        removeListener: function () {}
      };
    };
  }

  if (typeof window.CustomEvent !== 'function') {
    window.CustomEvent = function (event, params) {
      params = params || { bubbles: false, cancelable: false, detail: null };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    window.CustomEvent.prototype = window.Event ? window.Event.prototype : {};
  }



  function addRootClass(name) {
    var root = document.documentElement;
    if ((' ' + root.className + ' ').indexOf(' ' + name + ' ') === -1) root.className += (root.className ? ' ' : '') + name;
  }
  function detectFlexGap() {
    if (!document.body) return;
    var flex = document.createElement('div');
    flex.style.display = 'flex';
    flex.style.flexDirection = 'column';
    flex.style.rowGap = '1px';
    flex.style.position = 'absolute';
    flex.style.left = '-9999px';
    flex.appendChild(document.createElement('div'));
    flex.appendChild(document.createElement('div'));
    document.body.appendChild(flex);
    var supported = flex.scrollHeight === 1;
    document.body.removeChild(flex);
    if (!supported) addRootClass('no-flexgap');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', detectFlexGap, false);
  else detectFlexGap();

  // HTML5 elements for very old Trident-based browsers.
  var elements = ['main','header','footer','nav','section','article','aside','figure','figcaption','time','picture'];
  for (var i = 0; i < elements.length; i++) document.createElement(elements[i]);
})(window, document);

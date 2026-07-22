(function (window, document) {
  'use strict';
  var root = document.documentElement;
  if (root.className.indexOf('uc-ready') === -1) root.className += (root.className ? ' ' : '') + 'uc-ready';

  var body = document.body;
  if (!body) return;
  var ambient = document.createElement('div');
  ambient.className = 'uc-ambient';
  ambient.setAttribute('aria-hidden', 'true');
  ambient.innerHTML = '<i class="uc-orb"></i><i class="uc-orb"></i><i class="uc-orb"></i>';
  if (body.firstChild) body.insertBefore(ambient, body.firstChild); else body.appendChild(ambient);

  var visual = document.querySelector('.premium-hero-visual');
  var person = document.querySelector('.hero-person');
  var reduce = false;
  var finePointer = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    finePointer = window.matchMedia('(pointer: fine)').matches;
  } catch (ignore) {}
  if (visual && person && !reduce && finePointer) {
    var moveEvent = ('onpointermove' in window) ? 'pointermove' : 'mousemove';
    var leaveEvent = ('onpointerleave' in window) ? 'pointerleave' : 'mouseleave';
    visual.addEventListener(moveEvent, function (event) {
      var rect = visual.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      var transform = 'translate3d(' + (x * 12) + 'px,' + (y * 8) + 'px,0)';
      person.style.webkitTransform = transform;
      person.style.transform = transform;
    }, false);
    visual.addEventListener(leaveEvent, function () {
      person.style.webkitTransform = '';
      person.style.transform = '';
    }, false);
  }

  var cards = document.querySelectorAll('.program-card,.value-grid>div,.principle-list>div,.disclosure-grid article,.english-cards article');
  for (var i = 0; i < cards.length; i++) cards[i].style.setProperty ? cards[i].style.setProperty('--uc-index', String(i)) : null;
})(window, document);

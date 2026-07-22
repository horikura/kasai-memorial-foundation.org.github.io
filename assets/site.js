(function (window, document) {
  'use strict';

  function each(nodes, callback) {
    if (!nodes) return;
    for (var i = 0; i < nodes.length; i++) callback(nodes[i], i);
  }
  function hasClass(el, name) {
    return !!el && (' ' + el.className + ' ').indexOf(' ' + name + ' ') !== -1;
  }
  function addClass(el, name) {
    if (el && !hasClass(el, name)) el.className = (el.className ? el.className + ' ' : '') + name;
  }
  function removeClass(el, name) {
    if (!el) return;
    el.className = (' ' + el.className + ' ').replace(new RegExp('\\s' + name + '\\s', 'g'), ' ').replace(/^\s+|\s+$/g, '');
  }
  function toggleClass(el, name, enabled) {
    if (enabled) addClass(el, name); else removeClass(el, name);
  }
  function getScrollY() {
    return typeof window.pageYOffset === 'number' ? window.pageYOffset : (document.documentElement.scrollTop || document.body.scrollTop || 0);
  }
  function safeFocus(el) {
    if (el && typeof el.focus === 'function') {
      try { el.focus(); } catch (ignore) {}
    }
  }
  function supportsReducedMotion() {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (ignore) { return false; }
  }

  var body = document.body;
  if (!body) return;
  var html = document.documentElement;
  var isEnglish = ((html.getAttribute('lang') || '').toLowerCase().indexOf('en') === 0);
  var header = document.querySelector('.premium-header');
  var menu = document.querySelector('.premium-menu-button');
  var nav = document.querySelector('.premium-nav');
  var backTop = document.querySelector('.back-to-top');
  var progress = document.querySelector('.reading-progress span');

  function updateScroll() {
    var y = getScrollY();
    toggleClass(header, 'is-scrolled', y > 18);
    toggleClass(backTop, 'is-visible', y > 600);
    if (progress) {
      var max = Math.max(0, (document.documentElement.scrollHeight || document.body.scrollHeight) - (window.innerHeight || document.documentElement.clientHeight));
      var value = max > 0 ? Math.min(1, y / max) : 0;
      progress.style.webkitTransform = 'scaleX(' + value + ')';
      progress.style.transform = 'scaleX(' + value + ')';
    }
  }
  updateScroll();
  if (window.addEventListener) window.addEventListener('scroll', updateScroll, false);

  function closeMenu() {
    if (menu) menu.setAttribute('aria-expanded', 'false');
    removeClass(nav, 'is-open');
    removeClass(body, 'menu-open');
    if (menu) {
      var label = menu.querySelector('.sr-only');
      if (label) label.textContent = isEnglish ? 'Open menu' : 'メニューを開く';
    }
  }
  if (menu && menu.addEventListener) {
    menu.addEventListener('click', function () {
      var open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggleClass(nav, 'is-open', open);
      toggleClass(body, 'menu-open', open);
      var label = menu.querySelector('.sr-only');
      if (label) label.textContent = open ? (isEnglish ? 'Close menu' : 'メニューを閉じる') : (isEnglish ? 'Open menu' : 'メニューを開く');
    }, false);
  }
  if (nav) each(nav.querySelectorAll('a'), function (link) { link.addEventListener('click', closeMenu, false); });
  if (window.addEventListener) window.addEventListener('resize', function () { if ((window.innerWidth || document.documentElement.clientWidth) > 980) closeMenu(); }, false);

  var reveals = document.querySelectorAll('.reveal');
  if (typeof window.IntersectionObserver === 'function' && !supportsReducedMotion()) {
    var observer = new window.IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          addClass(entry.target, 'is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -30px' });
    each(reveals, function (el) { observer.observe(el); });
  } else {
    each(reveals, function (el) { addClass(el, 'is-visible'); });
  }

  if (backTop) backTop.addEventListener('click', function () {
    if ('scrollBehavior' in document.documentElement.style && !supportsReducedMotion()) {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); return; } catch (ignore) {}
    }
    window.scrollTo(0, 0);
  }, false);
  each(document.querySelectorAll('[data-current-year]'), function (el) { el.textContent = String(new Date().getFullYear()); });

  // Site search.
  var searchDialog = document.querySelector('#site-search');
  var searchInput = document.querySelector('#site-search-input');
  var results = document.querySelector('#site-search-results');
  var pages = [
    ['財団について','設立理念 代表挨拶 使命 活動原則 団体概要','zaidan.html'],
    ['葛西氏とは','葛西清重 奥州合戦 奥州仕置 葛西大崎一揆 歴史 年表','kasaishi.html'],
    ['定款','目的 事業 メンバー 役員 会議 会計 規程','teikan.html'],
    ['表彰・出展','葛西文化賞 奨励賞 展示 出展 推薦','hyousyou.html'],
    ['公式YouTube','動画 チャンネル 映像 制作方針','youtube.html'],
    ['メンバー加入','参加 申込 調査 記録 広報 賛助','member.html'],
    ['お知らせ','設立 サイト 公開 募集','news.html'],
    ['情報公開','運営 事業 会計 報告 法人格','disclosure.html'],
    ['お問い合わせ','史料提供 取材 展示 共同企画 訂正','contact.html'],
    ['個人情報保護方針','プライバシー 写真 未成年 開示 削除','privacy.html'],
    ['サイト利用案内','著作権 免責 リンク アクセシビリティ','sitepolicy.html'],
    ['English','English overview mission contact','english.html']
  ];
  var previousFocus = null;
  function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function renderSearch(query) {
    if (!results) return;
    var s = String(query || '').replace(/^\s+|\s+$/g, '').toLowerCase();
    var matches = [];
    for (var i = 0; i < pages.length; i++) {
      if (!s || (pages[i][0] + ' ' + pages[i][1]).toLowerCase().indexOf(s) !== -1) matches.push(pages[i]);
      if (!s && matches.length === 6) break;
    }
    if (!matches.length) {
      results.innerHTML = isEnglish ? '<p class="search-empty">No matching page was found.</p>' : '<p class="search-empty">該当するページが見つかりませんでした。</p>';
      return;
    }
    var htmlText = '';
    for (var j = 0; j < matches.length; j++) {
      htmlText += '<a href="' + escapeHtml(matches[j][2]) + '"><strong>' + escapeHtml(matches[j][0]) + '</strong><span>' + escapeHtml(matches[j][1]) + '</span><i aria-hidden="true">→</i></a>';
    }
    results.innerHTML = htmlText;
  }
  function openSearch() {
    if (!searchDialog) return;
    previousFocus = document.activeElement;
    searchDialog.removeAttribute('hidden');
    window.requestAnimationFrame(function () { addClass(searchDialog, 'is-open'); });
    addClass(body, 'dialog-open');
    renderSearch('');
    window.setTimeout(function () { safeFocus(searchInput); }, 80);
  }
  function closeSearch() {
    if (!searchDialog || searchDialog.hasAttribute('hidden')) return;
    removeClass(searchDialog, 'is-open');
    removeClass(body, 'dialog-open');
    window.setTimeout(function () { searchDialog.setAttribute('hidden', 'hidden'); }, 180);
    safeFocus(previousFocus);
  }
  each(document.querySelectorAll('.search-open'), function (button) { button.addEventListener('click', openSearch, false); });
  each(document.querySelectorAll('[data-search-close]'), function (button) { button.addEventListener('click', closeSearch, false); });
  if (searchInput) searchInput.addEventListener('input', function () { renderSearch(searchInput.value); }, false);
  document.addEventListener('keydown', function (event) {
    event = event || window.event;
    var key = event.key || event.keyCode;
    if (key === 'Escape' || key === 27) {
      closeMenu();
      closeSearch();
    }
    var letter = event.key ? event.key.toLowerCase() : String.fromCharCode(event.keyCode || 0).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && letter === 'k') {
      if (event.preventDefault) event.preventDefault(); else event.returnValue = false;
      openSearch();
    }
  }, false);

  // News filters.
  var filterButtons = document.querySelectorAll('[data-news-filter]');
  var articles = document.querySelectorAll('[data-news-category]');
  each(filterButtons, function (button) {
    button.addEventListener('click', function () {
      each(filterButtons, function (item) { removeClass(item, 'is-active'); });
      addClass(button, 'is-active');
      var filter = button.getAttribute('data-news-filter');
      each(articles, function (article) {
        if (filter !== 'all' && article.getAttribute('data-news-category') !== filter) article.setAttribute('hidden', 'hidden');
        else article.removeAttribute('hidden');
      });
    }, false);
  });

  // Character counters.
  each(document.querySelectorAll('[data-counter-for]'), function (counter) {
    var name = counter.getAttribute('data-counter-for');
    var field = name ? document.getElementsByName(name)[0] : null;
    function update() { counter.textContent = field && field.value ? field.value.length : 0; }
    if (field) field.addEventListener('input', update, false);
    update();
  });

  each(document.querySelectorAll('[data-print]'), function (button) { button.addEventListener('click', function () { window.print(); }, false); });

  // PWA registration: only secure contexts, and never required for normal viewing.
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      try {
        var registration = navigator.serviceWorker.register('service-worker.js');
        if (registration && registration['catch']) registration['catch'](function () {});
      } catch (ignore) {}
    }, false);
  }
})(window, document);

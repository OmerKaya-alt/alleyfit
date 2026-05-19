/* Alleyfit Pilates - site interactions
 * Vibecycle.com davranis kopyasi: transparent navbar -> scroll state,
 * w-nav-button hamburger -> w-nav-overlay drawer, masthead reveal-on-load,
 * IntersectionObserver ile scroll-reveal, akici hash-anchor scroll'u.
 * Saf vanilla JS; script tag ile dogrudan yuklenir.
 */
(function () {
  'use strict';

  // --- Sabitler ---
  var SCROLL_THRESHOLD = 24;          // navbar transparent -> solid esik (px)
  var REVEAL_ROOT_MARGIN = '0px 0px -10% 0px';
  var REVEAL_THRESHOLD = 0.1;
  var DRAWER_TRANSITION_MS = 333;     // Webflow data-duration ile ayni
  var STATE = {
    SCROLLED: 'is-scrolled',
    OPEN: 'is-open',                  // header & body & burger uzerinde
    LOCKED: 'is-locked',              // body scroll lock
    ACTIVE: 'is-active',              // drawer goster/gizle
    VISIBLE: 'is-visible',            // reveal hedefleri
    READY: 'is-ready'                 // ilk yuklemede masthead reveal
  };

  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); return; }
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  // ---------------------------------------------------------------
  // 1) NAVBAR SCROLL STATE
  //    Vibecycle: .global-navbar.transparent ust kisimda transparent;
  //    sayfa kayinca arka plan dolar. Biz .is-scrolled toggle ediyoruz.
  // ---------------------------------------------------------------
  function initNavScroll() {
    var header = document.querySelector('.global-navbar, header[role="banner"], .navbar');
    if (!header) return;

    var ticking = false;
    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      header.classList.toggle(STATE.SCROLLED, y > SCROLL_THRESHOLD);
      ticking = false;
    }
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
  }

  // ---------------------------------------------------------------
  // 2) HAMBURGER + DRAWER
  //    Vibecycle Webflow w-nav: .w-nav-button (icon) tiklaninca
  //    .w-nav-menu (drawer) acilir; .w-nav-overlay scrim olur.
  //    Biz benzer davranisi vanilla yaziyoruz: header.is-open + body.is-locked
  //    + drawer.is-active. Esc / backdrop / link tikla / resize ile kapanir.
  // ---------------------------------------------------------------
  function initDrawer() {
    var header = document.querySelector('.global-navbar, header[role="banner"], .navbar');
    var burger = document.querySelector('.w-nav-button, .hamburger-menu-icon, .nav-toggle');
    var drawer = document.querySelector('.hamburger-modal, .w-nav-overlay, .nav-drawer');
    if (!burger || !drawer) return;

    var lastFocus = null;

    function isOpen() {
      return drawer.classList.contains(STATE.ACTIVE);
    }

    function open() {
      if (isOpen()) return;
      lastFocus = document.activeElement;
      drawer.classList.add(STATE.ACTIVE);
      if (header) header.classList.add(STATE.OPEN);
      burger.classList.add(STATE.OPEN);
      document.body.classList.add(STATE.LOCKED);
      burger.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      // ilk linke fokus (klavye erisilebilirligi)
      var firstLink = drawer.querySelector('a, button');
      if (firstLink) {
        window.setTimeout(function () { firstLink.focus(); }, DRAWER_TRANSITION_MS);
      }
    }

    function close() {
      if (!isOpen()) return;
      drawer.classList.remove(STATE.ACTIVE);
      if (header) header.classList.remove(STATE.OPEN);
      burger.classList.remove(STATE.OPEN);
      document.body.classList.remove(STATE.LOCKED);
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }

    function toggle() { isOpen() ? close() : open(); }

    // ARIA baslangic
    burger.setAttribute('aria-expanded', 'false');
    if (!burger.hasAttribute('aria-controls') && drawer.id) {
      burger.setAttribute('aria-controls', drawer.id);
    }
    drawer.setAttribute('aria-hidden', 'true');

    // Click + klavye (Enter/Space)
    burger.addEventListener('click', function (e) {
      e.preventDefault();
      toggle();
    });
    burger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    // Drawer icindeki linke tiklayinca kapan; backdrop tiklayinca kapan
    drawer.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.closest && t.closest('a')) {
        close();
      } else if (t === drawer) {
        close();
      }
    });

    // Esc ile kapan
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) close();
    });

    // Genis ekrana gecince kapan (Webflow medium: 991px)
    var mq = window.matchMedia('(min-width: 992px)');
    var onMq = function (ev) { if (ev.matches) close(); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);
  }

  // ---------------------------------------------------------------
  // 3) SCROLL REVEAL
  //    Vibecycle data-w-id elemanlari yuklendiginde opacity:0 ile baslar,
  //    Webflow IX2 onlari fade-in eder. Biz [data-reveal] ya da yaygin
  //    section/card siniflarini yakalar, .is-visible ekleriz.
  // ---------------------------------------------------------------
  function initReveal() {
    var selector = [
      '[data-reveal]',
      '.section-std',
      '.split-cell',
      '.collection-item',
      '.masthead-h1',
      '.masthead-subtitle',
      '.h2',
      '.paragraph-reg'
    ].join(',');

    var nodes = document.querySelectorAll(selector);
    if (!nodes.length) return;

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add(STATE.VISIBLE); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add(STATE.VISIBLE);
          io.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: REVEAL_ROOT_MARGIN,
      threshold: REVEAL_THRESHOLD
    });

    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    Array.prototype.forEach.call(nodes, function (n) {
      if (reduced) { n.classList.add(STATE.VISIBLE); return; }
      io.observe(n);
    });
  }

  // ---------------------------------------------------------------
  // 4) MASTHEAD READY
  //    Vibecycle masthead-h1'ler load'da fade-in. Biz body uzerine
  //    .is-ready koyariz; CSS bunu kullanip ilk ekranin reveal'ini yapar.
  // ---------------------------------------------------------------
  function initMastheadReady() {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.body.classList.add(STATE.READY);
      });
    });
  }

  // ---------------------------------------------------------------
  // 5) SMOOTH ANCHOR
  //    href="#xyz" linkleri icin sticky-header ofsetli yumusak scroll.
  // ---------------------------------------------------------------
  function initAnchorScroll() {
    var header = document.querySelector('.global-navbar, header[role="banner"], .navbar');
    document.addEventListener('click', function (e) {
      var link = e.target && e.target.closest && e.target.closest('a[href^="#"]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      var target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();
      var offset = header ? header.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      var prefersReduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      window.scrollTo({
        top: top,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });

      if (history.pushState) history.pushState(null, '', href);
    });
  }

  // ---------------------------------------------------------------
  // 6) MARQUEE / TICKER
  //    Vibecycle marquee CSS @keyframes ile calisiyor; JS gerekmez.
  //    Yine de icerigi loop icin clone'lariz, tab arka plana gecince
  //    pause ederiz; boylece performans + erisilebilirlik kazanir.
  // ---------------------------------------------------------------
  function initMarquee() {
    var tracks = document.querySelectorAll('.marquee-content, [data-marquee]');
    if (!tracks.length) return;

    Array.prototype.forEach.call(tracks, function (track) {
      if (!track.dataset.cloned) {
        var html = track.innerHTML;
        track.innerHTML = html + html;
        track.dataset.cloned = '1';
      }
    });

    document.addEventListener('visibilitychange', function () {
      Array.prototype.forEach.call(tracks, function (track) {
        track.style.animationPlayState = document.hidden ? 'paused' : 'running';
      });
    });
  }

  // --- Boot ---
  ready(function () {
    initNavScroll();
    initDrawer();
    initReveal();
    initMastheadReady();
    initAnchorScroll();
    initMarquee();
  });
}());

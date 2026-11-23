/* kianabbasnejad.com: the tabs on the one-page site.
   Without this script the tabs are plain links to the sections of the page and everything works.
   With it: the tabs stay at the top of the window, the tab of the section in view is marked,
   and "Home" scrolls to the top instead of loading the page again. */
(function () {
  var doc = document, root = doc.documentElement;
  var nav = doc.querySelector('.tabs');
  if (!nav) return;
  var links = [].slice.call(nav.querySelectorAll('a[data-s]'));
  if (!links.length) return;
  var heads = links.map(function (a) { return doc.getElementById(a.getAttribute('data-s')); });
  root.classList.add('js');

  var chosen = -1;      // the tab the visitor clicked; it stays marked until they scroll by hand
  var waiting = false;

  function update() {
    waiting = false;
    var box = nav.getBoundingClientRect();
    nav.classList.toggle('stuck', box.top <= 0 && window.pageYOffset > 0);
    // A section is "in view" once its heading has passed a line just below the tabs. Near the end of the
    // page that line moves down to the bottom of the window, because the last sections are too short to
    // reach the top; this way each of them is still marked in turn.
    var view = window.innerHeight, line = box.bottom + 48;
    var left = root.scrollHeight - view - window.pageYOffset;
    if (left < view && view > line) line += (view - line) * (1 - Math.max(left, 0) / view);
    var current = 0;
    for (var i = 1; i < heads.length; i++) {
      if (heads[i] && heads[i].getBoundingClientRect().top <= line) current = i;
    }
    if (chosen >= 0) current = chosen;
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  function later() { if (!waiting) { waiting = true; requestAnimationFrame(update); } }

  function fromHash() {
    var id = location.hash.replace('#', '');
    chosen = -1;
    links.forEach(function (a, i) { if (id && a.getAttribute('data-s') === id) chosen = i; });
    later();
  }
  function release() { if (chosen >= 0) { chosen = -1; later(); } }

  links.forEach(function (a, i) {
    a.addEventListener('click', function () { chosen = i; later(); });
  });
  // "Home" and the name: scroll to the top
  [].forEach.call(doc.querySelectorAll('a[href="/"]'), function (a) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      chosen = 0;
      window.scrollTo(0, 0);
      if (location.hash && history.pushState) history.pushState(null, '', '/');
      later();
    });
  });

  window.addEventListener('scroll', later, { passive: true });
  window.addEventListener('resize', later);
  window.addEventListener('load', later);
  window.addEventListener('hashchange', fromHash);
  ['wheel', 'touchstart', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, release, { passive: true });
  });
  window.addEventListener('keydown', function (e) {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].indexOf(e.key) >= 0) release();
  });
  fromHash();
})();

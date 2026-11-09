/* nav.js — one frosted highlight for the whole menu.
 *
 * The highlight is a single element behind the links. It is placed from
 * bounding rects (not offsets, which are unreliable for inline boxes), so it
 * lands exactly on the link whatever the padding, font or wrapping.
 *
 * Clicking an item slides it over first, then the page changes — so the move
 * is actually seen. Modifier-clicks (new tab, save, …) are left alone.
 */
(function () {
  var bar = document.querySelector('.nav__links');
  if (!bar) return;

  var links = Array.prototype.slice.call(bar.querySelectorAll('a'));
  if (!links.length) return;

  var ink = document.createElement('span');
  ink.className = 'nav__ink';
  ink.setAttribute('aria-hidden', 'true');
  bar.insertBefore(ink, bar.firstChild);

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function place(target) {
    if (!target) return;
    var box = bar.getBoundingClientRect();
    var rect = target.getBoundingClientRect();
    ink.style.width = rect.width + 'px';
    ink.style.height = rect.height + 'px';
    ink.style.transform = 'translate(' + (rect.left - box.left) + 'px,' + (rect.top - box.top) + 'px)';
    ink.style.opacity = '1';
  }

  var current = bar.querySelector('a[aria-current="page"]');
  if (current) place(current);

  /* the font can arrive after the first paint and change every width */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { place(bar.querySelector('a[aria-current="page"]')); });
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      event.preventDefault();
      place(link);
      if (calm.matches) { window.location.href = href; return; }
      window.setTimeout(function () { window.location.href = href; }, 340);
    });
  });

  window.addEventListener('resize', function () {
    place(bar.querySelector('a[aria-current="page"]') || current);
  });
})();

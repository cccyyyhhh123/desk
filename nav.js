/* nav.js — one frosted highlight for the whole menu.
 *
 * The menu lives on six separate pages, so a highlight that slides "from the
 * old item to the new one" has to survive a document swap. It does that by
 * writing the current page's item into sessionStorage before anything else,
 * and then, on the next page, putting the highlight back where it was and
 * animating it to the item you just landed on.
 *
 * Positions come from bounding rects rather than offsetLeft/offsetTop, which
 * are unreliable for inline boxes.
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
  var LAST = 'deskNavLast';

  var current = bar.querySelector('a[aria-current="page"]');
  if (!current) return;

  function linkFor(href) {
    if (!href) return null;
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === href) return links[i];
    }
    return null;
  }

  function place(target, instant) {
    if (!target) return;
    var outer = bar.getBoundingClientRect();
    var rect = target.getBoundingClientRect();

    if (instant) {
      ink.style.transition = 'none';
      ink.style.width = rect.width + 'px';
      ink.style.height = rect.height + 'px';
      ink.style.transform = 'translate(' + (rect.left - outer.left) + 'px,' + (rect.top - outer.top) + 'px)';
      ink.style.opacity = '1';
      void ink.offsetWidth;          /* hold the transition off for this pass */
      ink.style.transition = '';     /* …then hand it back to the stylesheet */
      return;
    }

    ink.style.width = rect.width + 'px';
    ink.style.height = rect.height + 'px';
    ink.style.transform = 'translate(' + (rect.left - outer.left) + 'px,' + (rect.top - outer.top) + 'px)';
    ink.style.opacity = '1';
  }

  var previousHref = null;
  try { previousHref = sessionStorage.getItem(LAST); } catch (e) {}
  var previous = linkFor(previousHref);

  /* the page we came from is different from this one: start there, travel here */
  if (previous && previous !== current && !calm.matches) {
    place(previous, true);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { place(current); });
    });
  } else {
    place(current, true);
  }

  var currentHref = current.getAttribute('href');
  try { sessionStorage.setItem(LAST, currentHref); } catch (e) {}

  /* the font can arrive after the first paint and change every width */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (!previous || previous === current) place(current, true);
    });
  }

  /* a resize can reflow the menu under the highlight */
  window.addEventListener('resize', function () {
    place(bar.querySelector('a[aria-current="page"]') || current, true);
  });
})();

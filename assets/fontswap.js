/* Non-render-blocking web fonts (CSP-safe, no inline handlers).
   The font stylesheet is loaded with media="print" so it never blocks
   first paint; this flips it to "all" as soon as it's parsed. */
(function () {
  var l = document.getElementById('npf');
  if (l) { l.media = 'all'; }
})();

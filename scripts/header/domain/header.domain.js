(function registerHeaderDomain(global) {
  function isMenuOpen(menuToggle) {
    return String(menuToggle?.getAttribute('aria-expanded') || 'false') === 'true';
  }

  function getResizeDesktopQuery() {
    return '(min-width: 48em)';
  }

  function getMobileMenuQuery() {
    return '(max-width: 47.99em)';
  }

  function shouldAdjustArticlesHash(win = window) {
    return String(win.location?.hash || '') === '#articles';
  }

  function getArticlesScrollOffset() {
    return 100;
  }

  global.SiteAdvogadaHeaderDomain = {
    isMenuOpen,
    getResizeDesktopQuery,
    getMobileMenuQuery,
    shouldAdjustArticlesHash,
    getArticlesScrollOffset
  };
})(window);

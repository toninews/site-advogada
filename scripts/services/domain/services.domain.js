(function registerServicesDomain(global) {
  function shouldSkipAnimation(win = window) {
    try {
      return Boolean(win.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_) {
      return false;
    }
  }

  function getObserverOptions() {
    return { threshold: 0.22, rootMargin: '0px 0px -10% 0px' };
  }

  global.SiteAdvogadaServicesDomain = {
    shouldSkipAnimation,
    getObserverOptions
  };
})(window);

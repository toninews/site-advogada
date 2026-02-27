(function registerHistoryDomain(global) {
  const MOBILE_MAX_WIDTH = 980;
  const DESKTOP_MIN_WIDTH = 981;

  function getObserverOptions() {
    return { threshold: 0.2 };
  }

  function isMobileViewport(win = window) {
    return Boolean(win.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches);
  }

  function isDesktopViewport(win = window) {
    return Boolean(win.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches);
  }

  global.SiteAdvogadaHistoryDomain = {
    MOBILE_MAX_WIDTH,
    DESKTOP_MIN_WIDTH,
    getObserverOptions,
    isMobileViewport,
    isDesktopViewport
  };
})(window);

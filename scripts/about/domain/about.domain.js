(function registerAboutDomain(global) {
  function getRevealSelector() {
    return '.hidden';
  }

  function getRevealClassName() {
    return 'show';
  }

  function getObserverOptions() {
    return { threshold: 0 };
  }

  global.SiteAdvogadaAboutDomain = {
    getRevealSelector,
    getRevealClassName,
    getObserverOptions
  };
})(window);

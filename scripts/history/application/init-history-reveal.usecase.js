(function registerInitHistoryRevealUseCase(global) {
  function createInitHistoryRevealUseCase(deps) {
    const { domain } = deps;

    function buildPlan() {
      return {
        observerOptions: domain.getObserverOptions(),
        shouldToggleCardOnClick: () => domain.isMobileViewport(window),
        shouldResetCardOnResize: () => domain.isDesktopViewport(window)
      };
    }

    return {
      buildPlan
    };
  }

  global.SiteAdvogadaInitHistoryRevealUseCase = {
    createInitHistoryRevealUseCase
  };
})(window);

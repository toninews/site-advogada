(function registerInitAboutRevealUseCase(global) {
  function createInitAboutRevealUseCase(deps) {
    const { domain } = deps;

    function buildRevealPlan() {
      return {
        selector: domain.getRevealSelector(),
        className: domain.getRevealClassName(),
        observerOptions: domain.getObserverOptions()
      };
    }

    return {
      buildRevealPlan
    };
  }

  global.SiteAdvogadaInitAboutRevealUseCase = {
    createInitAboutRevealUseCase
  };
})(window);

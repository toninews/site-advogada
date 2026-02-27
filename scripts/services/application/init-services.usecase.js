(function registerInitServicesUseCase(global) {
  function createInitServicesUseCase(deps) {
    const { domain } = deps;

    function buildInitPlan() {
      return {
        skipAnimation: domain.shouldSkipAnimation(window),
        observerOptions: domain.getObserverOptions()
      };
    }

    return {
      buildInitPlan
    };
  }

  global.SiteAdvogadaInitServicesUseCase = {
    createInitServicesUseCase
  };
})(window);

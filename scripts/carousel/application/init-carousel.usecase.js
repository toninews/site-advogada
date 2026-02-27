(function registerInitCarouselUseCase(global) {
  function createInitCarouselUseCase(deps) {
    const { domain } = deps;

    function buildPlan() {
      return {
        autoplayDelayMs: domain.getAutoplayDelayMs(),
        warmupDelayMs: domain.getWarmupDelayMs(),
        idleWarmupTimeoutMs: domain.getIdleWarmupTimeoutMs(),
        normalizeIndex: (index, length) => domain.normalizeIndex(index, length),
        indicatorTransform: (index) => domain.buildIndicatorTransform(index)
      };
    }

    return {
      buildPlan
    };
  }

  global.SiteAdvogadaInitCarouselUseCase = {
    createInitCarouselUseCase
  };
})(window);

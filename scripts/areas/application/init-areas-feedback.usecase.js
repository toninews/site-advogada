(function registerInitAreasFeedbackUseCase(global) {
  function createInitAreasFeedbackUseCase(deps) {
    const { domain } = deps;

    function createFeedbackState() {
      return {
        message: domain.getFeedbackMessage(),
        clearDelayMs: domain.getClearDelayMs()
      };
    }

    return {
      createFeedbackState
    };
  }

  global.SiteAdvogadaInitAreasFeedbackUseCase = {
    createInitAreasFeedbackUseCase
  };
})(window);

(function registerAreasController(global) {
  function createAreasController(deps) {
    const { useCase } = deps;

    const links = Array.from(document.querySelectorAll('.area-more-btn'));
    const feedback = document.getElementById('areas-feedback');

    if (!links.length || !feedback) {
      return { start: () => {} };
    }

    let clearTimer = null;

    function showFeedback(state) {
      feedback.textContent = state.message;
      feedback.classList.add('is-visible');

      if (clearTimer) {
        clearTimeout(clearTimer);
      }

      clearTimer = setTimeout(() => {
        feedback.classList.remove('is-visible');
      }, state.clearDelayMs);
    }

    function start() {
      const state = useCase.createFeedbackState();
      links.forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          showFeedback(state);
        });
      });
    }

    return { start };
  }

  global.SiteAdvogadaAreasController = {
    createAreasController
  };
})(window);

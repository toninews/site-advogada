(function registerHistoryController(global) {
  function createHistoryController(deps) {
    const { useCase } = deps;

    const revealCard = document.querySelector('.history-reveal-card');
    const section = document.querySelector('#history');

    function bindObserver(plan) {
      if (!section || !('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const mainText = entry.target.querySelector('.history-main-text');
          if (!mainText) return;
          mainText.classList.toggle('show', entry.isIntersecting);
        });
      }, plan.observerOptions);

      observer.observe(section);
    }

    function bindCardInteractions(plan) {
      if (!revealCard) return;

      revealCard.addEventListener('click', (event) => {
        if (!plan.shouldToggleCardOnClick()) return;
        revealCard.classList.toggle('is-open');
        event.stopPropagation();
      });

      document.addEventListener('click', (event) => {
        if (!plan.shouldToggleCardOnClick()) return;
        if (!revealCard.contains(event.target)) {
          revealCard.classList.remove('is-open');
        }
      });

      window.addEventListener('resize', () => {
        if (plan.shouldResetCardOnResize()) {
          revealCard.classList.remove('is-open');
        }
      });
    }

    function start() {
      const plan = useCase.buildPlan();
      bindObserver(plan);
      bindCardInteractions(plan);
    }

    return { start };
  }

  global.SiteAdvogadaHistoryController = {
    createHistoryController
  };
})(window);

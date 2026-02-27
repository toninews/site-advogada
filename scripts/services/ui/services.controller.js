(function registerServicesController(global) {
  function createServicesController(deps) {
    const { useCase } = deps;

    const cards = Array.from(document.querySelectorAll('.service-card'));
    const section = document.querySelector('#services');

    if (!cards.length || !section) {
      return { start: () => {} };
    }

    function setCardsVisible(isVisible) {
      cards.forEach((card) => {
        card.classList.toggle('is-visible', Boolean(isVisible));
      });
    }

    function start() {
      const plan = useCase.buildInitPlan();
      if (plan.skipAnimation) {
        setCardsVisible(true);
        return;
      }

      if (!('IntersectionObserver' in window)) {
        setCardsVisible(true);
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          setCardsVisible(entry.isIntersecting);
        });
      }, plan.observerOptions);

      observer.observe(section);
    }

    return { start };
  }

  global.SiteAdvogadaServicesController = {
    createServicesController
  };
})(window);

(function registerAboutController(global) {
  function createAboutController(deps) {
    const { useCase } = deps;

    function start() {
      const plan = useCase.buildRevealPlan();
      const elements = Array.from(document.querySelectorAll(plan.selector));
      if (!elements.length) return;

      if (!('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add(plan.className));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(plan.className);
          }
        });
      }, plan.observerOptions);

      elements.forEach((el) => observer.observe(el));
    }

    return { start };
  }

  global.SiteAdvogadaAboutController = {
    createAboutController
  };
})(window);

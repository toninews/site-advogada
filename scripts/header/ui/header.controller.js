(function registerHeaderController(global) {
  function createHeaderController(deps) {
    const { useCase } = deps;

    function start() {
      const plan = useCase.buildPlan();
      const menuToggle = document.querySelector(plan.selectors.menuToggle);
      const siteMenu = document.querySelector(plan.selectors.siteMenu);
      if (!menuToggle || !siteMenu) return;

      const closeMenu = () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        siteMenu.classList.remove('is-open');
      };

      const adjustHashScroll = () => {
        if (!plan.shouldAdjustArticlesHash()) return;
        const target = document.querySelector(plan.selectors.articlesTarget);
        if (!target) return;
        const top = target.getBoundingClientRect().top + window.scrollY - plan.scrollOffset;
        window.scrollTo({ top, behavior: 'auto' });
      };

      menuToggle.addEventListener('click', () => {
        const open = plan.isMenuOpen(menuToggle);
        menuToggle.setAttribute('aria-expanded', String(!open));
        menuToggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
        siteMenu.classList.toggle('is-open');
      });

      document.addEventListener('click', (event) => {
        if (!plan.isMenuOpen(menuToggle)) return;
        if (menuToggle.contains(event.target) || siteMenu.contains(event.target)) return;
        closeMenu();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });

      siteMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          if (window.matchMedia(plan.queries.mobileMenu).matches) {
            closeMenu();
          }
        });
      });

      window.addEventListener('resize', () => {
        if (window.matchMedia(plan.queries.desktopResize).matches) {
          closeMenu();
        }
      });

      window.addEventListener('load', () => {
        setTimeout(adjustHashScroll, 0);
      });

      window.addEventListener('hashchange', adjustHashScroll);
    }

    return { start };
  }

  global.SiteAdvogadaHeaderController = {
    createHeaderController
  };
})(window);

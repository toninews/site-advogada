(function registerInitHeaderMenuUseCase(global) {
  function createInitHeaderMenuUseCase(deps) {
    const { domain } = deps;

    function buildPlan() {
      return {
        selectors: {
          menuToggle: '.menu-toggle',
          siteMenu: '.site-menu',
          articlesTarget: '#articles'
        },
        queries: {
          mobileMenu: domain.getMobileMenuQuery(),
          desktopResize: domain.getResizeDesktopQuery()
        },
        scrollOffset: domain.getArticlesScrollOffset(),
        isMenuOpen: (menuToggle) => domain.isMenuOpen(menuToggle),
        shouldAdjustArticlesHash: () => domain.shouldAdjustArticlesHash(window)
      };
    }

    return {
      buildPlan
    };
  }

  global.SiteAdvogadaInitHeaderMenuUseCase = {
    createInitHeaderMenuUseCase
  };
})(window);

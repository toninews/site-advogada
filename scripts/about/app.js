(function bootstrapAbout(global) {
  const domain = global.SiteAdvogadaAboutDomain;
  const useCaseFactory = global.SiteAdvogadaInitAboutRevealUseCase;
  const controllerFactory = global.SiteAdvogadaAboutController;

  if (!domain || !useCaseFactory || !controllerFactory) {
    console.error('Falha ao inicializar about: dependencias ausentes.');
    return;
  }

  const useCase = useCaseFactory.createInitAboutRevealUseCase({ domain });
  const controller = controllerFactory.createAboutController({ useCase });
  controller.start();
})(window);

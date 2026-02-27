(function bootstrapAreas(global) {
  const domain = global.SiteAdvogadaAreasDomain;
  const useCaseFactory = global.SiteAdvogadaInitAreasFeedbackUseCase;
  const controllerFactory = global.SiteAdvogadaAreasController;

  if (!domain || !useCaseFactory || !controllerFactory) {
    console.error('Falha ao inicializar areas: dependencias ausentes.');
    return;
  }

  const useCase = useCaseFactory.createInitAreasFeedbackUseCase({ domain });
  const controller = controllerFactory.createAreasController({ useCase });
  controller.start();
})(window);

(function bootstrapHistory(global) {
  const domain = global.SiteAdvogadaHistoryDomain;
  const useCaseFactory = global.SiteAdvogadaInitHistoryRevealUseCase;
  const controllerFactory = global.SiteAdvogadaHistoryController;

  if (!domain || !useCaseFactory || !controllerFactory) {
    console.error('Falha ao inicializar history: dependencias ausentes.');
    return;
  }

  const useCase = useCaseFactory.createInitHistoryRevealUseCase({ domain });
  const controller = controllerFactory.createHistoryController({ useCase });
  controller.start();
})(window);

(function bootstrapHeader(global) {
  const domain = global.SiteAdvogadaHeaderDomain;
  const useCaseFactory = global.SiteAdvogadaInitHeaderMenuUseCase;
  const controllerFactory = global.SiteAdvogadaHeaderController;

  if (!domain || !useCaseFactory || !controllerFactory) {
    console.error('Falha ao inicializar header: dependencias ausentes.');
    return;
  }

  const useCase = useCaseFactory.createInitHeaderMenuUseCase({ domain });
  const controller = controllerFactory.createHeaderController({ useCase });
  controller.start();
})(window);

(function bootstrapServices(global) {
  const domain = global.SiteAdvogadaServicesDomain;
  const useCaseFactory = global.SiteAdvogadaInitServicesUseCase;
  const controllerFactory = global.SiteAdvogadaServicesController;

  if (!domain || !useCaseFactory || !controllerFactory) {
    console.error('Falha ao inicializar servicos: dependencias ausentes.');
    return;
  }

  const useCase = useCaseFactory.createInitServicesUseCase({ domain });
  const controller = controllerFactory.createServicesController({ useCase });
  controller.start();
})(window);

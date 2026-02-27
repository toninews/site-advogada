(function bootstrapCarousel(global) {
  const domain = global.SiteAdvogadaCarouselDomain;
  const useCaseFactory = global.SiteAdvogadaInitCarouselUseCase;
  const controllerFactory = global.SiteAdvogadaCarouselController;

  if (!domain || !useCaseFactory || !controllerFactory) {
    console.error('Falha ao inicializar carousel: dependencias ausentes.');
    return;
  }

  const useCase = useCaseFactory.createInitCarouselUseCase({ domain });
  const controller = controllerFactory.createCarouselController({ useCase });
  controller.start();
})(window);

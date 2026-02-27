(function bootstrapContact(global) {
  const domain = global.SiteAdvogadaContactDomain;
  const repositoryFactory = global.SiteAdvogadaContactRepository;
  const useCaseFactory = global.SiteAdvogadaSubmitContactUseCase;
  const controllerFactory = global.SiteAdvogadaContactController;
  const domainError = global.SiteAdvogadaDomainError || {};

  if (!domain || !repositoryFactory || !useCaseFactory || !controllerFactory) {
    console.error('Falha ao inicializar contato: dependencias ausentes.');
    return;
  }

  const repository = repositoryFactory.createContactRepository({ delayMs: 700 });
  const useCase = useCaseFactory.createSubmitContactUseCase({
    domain,
    repository,
    domainError
  });

  const controller = controllerFactory.createContactController({
    domain,
    useCase,
    domainError
  });

  controller.start();
})(window);

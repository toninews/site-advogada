(function bootstrapArticles(global) {
  const domain = global.SiteAdvogadaArticlesDomain;
  const domainError = global.SiteAdvogadaDomainError;
  const repositoryFactory = global.SiteAdvogadaArticlesRepository;
  const useCaseFactory = global.SiteAdvogadaLoadArticlesUseCase;
  const controllerFactory = global.SiteAdvogadaArticlesController;

  if (!domain || !domainError || !repositoryFactory || !useCaseFactory || !controllerFactory) {
    console.error('Falha ao inicializar artigos: dependencias ausentes.');
    return;
  }

  const apiBase = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:4010'
    : 'https://blog-back-n6z4.onrender.com';

  const config = {
    apiBase,
    apiUrl: `${apiBase}/articles?status=published&limit=6`,
    staticIndexUrl: 'artigos/index.json',
    uploadsBase: `${apiBase}/uploads`,
    isPhpRuntime: window.__SITE_RUNTIME__ === 'php',
    likedStorageKey: 'site-advogada-liked-articles-v1',
    fingerprintStorageKey: 'site-advogada-fingerprint-v1',
    metricsStorageKey: 'site-advogada-article-metrics-v1'
  };

  const storage = repositoryFactory.createStorageAdapter(config, domain);
  const repository = repositoryFactory.createHttpArticleRepository(config);
  const useCase = useCaseFactory.createLoadArticlesUseCase({
    repository,
    domain,
    domainError,
    isPhpRuntime: config.isPhpRuntime
  });

  const controller = controllerFactory.createArticlesController({
    useCase,
    storage,
    domain,
    domainError,
    config
  });

  controller.start();
})(window);

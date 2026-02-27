import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function createContext() {
  const context = {
    window: {},
    console,
    URLSearchParams,
    CSS: { escape: (value) => String(value) }
  };
  vm.createContext(context);
  return context;
}

function loadScript(context, relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(source, context, { filename: fullPath });
}

async function testStaticFallbackFlow() {
  const context = createContext();
  const calls = [];

  context.fetch = async (url, init = {}) => {
    calls.push({ url, method: init.method || 'GET', body: init.body || null });

    if (url === 'artigos/index.json') {
      return {
        ok: true,
        json: async () => [{ _id: 'a1', title: 'Static 1' }, { _id: 'a2', title: 'Static 2' }]
      };
    }

    throw new Error(`Unexpected URL in static flow: ${url}`);
  };

  loadScript(context, 'scripts/articles/domain/article.domain.js');
  loadScript(context, 'scripts/articles/domain/domain.error.js');
  loadScript(context, 'scripts/articles/adapters/articles.repository.js');
  loadScript(context, 'scripts/articles/application/load-articles.usecase.js');

  const repository = context.window.SiteAdvogadaArticlesRepository.createHttpArticleRepository({
    apiBase: 'https://api.test',
    apiUrl: 'https://api.test/articles?status=published&limit=6',
    staticIndexUrl: 'artigos/index.json'
  });

  const useCase = context.window.SiteAdvogadaLoadArticlesUseCase.createLoadArticlesUseCase({
    repository,
    domain: context.window.SiteAdvogadaArticlesDomain,
    domainError: context.window.SiteAdvogadaDomainError,
    isPhpRuntime: false
  });

  const result = await useCase.execute();
  assertTrue(result.source === 'static', 'execute should use static source when available');
  assertTrue(Array.isArray(result.items) && result.items.length === 2, 'execute should return static items');
  assertTrue(calls.length === 1, 'execute should not call API when static source has data');
}

async function testApiFallbackAndLikeFlow() {
  const context = createContext();
  const calls = [];

  context.fetch = async (url, init = {}) => {
    const method = init.method || 'GET';
    calls.push({ url, method, body: init.body || null });

    if (url === 'artigos/index.json') {
      return { ok: true, json: async () => [] };
    }

    if (url === 'https://api.test/articles?status=published&limit=6') {
      return { ok: true, json: async () => ({ data: [{ _id: 'id-1', slug: 'slug-1', title: 'API 1' }] }) };
    }

    if (url === 'https://api.test/articles/id-1') {
      return { ok: true, json: async () => ({ stats: { views: 71 }, metrics: { likes: 13 } }) };
    }

    if (url.startsWith('https://api.test/comments?')) {
      return { ok: true, json: async () => ({ total: 22 }) };
    }

    if (url === 'https://api.test/articles/id-1/like' && method === 'POST') {
      return { ok: true, json: async () => ({ likes: 14 }) };
    }

    throw new Error(`Unexpected URL in API flow: ${url} (${method})`);
  };

  loadScript(context, 'scripts/articles/domain/article.domain.js');
  loadScript(context, 'scripts/articles/domain/domain.error.js');
  loadScript(context, 'scripts/articles/adapters/articles.repository.js');
  loadScript(context, 'scripts/articles/application/load-articles.usecase.js');

  const domain = context.window.SiteAdvogadaArticlesDomain;
  const repository = context.window.SiteAdvogadaArticlesRepository.createHttpArticleRepository({
    apiBase: 'https://api.test',
    apiUrl: 'https://api.test/articles?status=published&limit=6',
    staticIndexUrl: 'artigos/index.json'
  });

  const useCase = context.window.SiteAdvogadaLoadArticlesUseCase.createLoadArticlesUseCase({
    repository,
    domain,
    domainError: context.window.SiteAdvogadaDomainError,
    isPhpRuntime: false
  });

  const result = await useCase.execute();
  assertTrue(result.source === 'api', 'execute should fallback to API when static is empty');
  assertTrue(result.items.length === 1 && result.items[0]._id === 'id-1', 'execute should return API items');

  const metrics = await useCase.syncCardMetrics({ rawId: 'id-1', rawSlug: 'slug-1' });
  assertTrue(metrics.views === 71, 'syncCardMetrics should resolve views from payload');
  assertTrue(metrics.likes === 13, 'syncCardMetrics should resolve likes from payload');
  assertTrue(metrics.comments === 22, 'syncCardMetrics should resolve comments total');

  const likePayload = await useCase.sendLike('id-1', 'POST', 'fp-123');
  assertTrue(likePayload.likes === 14, 'sendLike should return backend payload');

  const likeCall = calls.find((call) => call.url === 'https://api.test/articles/id-1/like' && call.method === 'POST');
  assertTrue(Boolean(likeCall), 'sendLike should hit like endpoint with POST');
  assertTrue(String(likeCall.body).includes('fp-123'), 'sendLike should forward fingerprint payload');
}

async function testDomainErrorOnApiFailure() {
  const context = createContext();

  context.fetch = async (url) => {
    if (url === 'artigos/index.json') {
      return { ok: true, json: async () => [] };
    }

    if (url === 'https://api.test/articles?status=published&limit=6') {
      return { ok: false, status: 503, json: async () => ({}) };
    }

    throw new Error(`Unexpected URL in failure flow: ${url}`);
  };

  loadScript(context, 'scripts/articles/domain/article.domain.js');
  loadScript(context, 'scripts/articles/domain/domain.error.js');
  loadScript(context, 'scripts/articles/adapters/articles.repository.js');
  loadScript(context, 'scripts/articles/application/load-articles.usecase.js');

  const repository = context.window.SiteAdvogadaArticlesRepository.createHttpArticleRepository({
    apiBase: 'https://api.test',
    apiUrl: 'https://api.test/articles?status=published&limit=6',
    staticIndexUrl: 'artigos/index.json'
  });

  const useCase = context.window.SiteAdvogadaLoadArticlesUseCase.createLoadArticlesUseCase({
    repository,
    domain: context.window.SiteAdvogadaArticlesDomain,
    domainError: context.window.SiteAdvogadaDomainError,
    isPhpRuntime: false
  });

  let thrownError = null;
  try {
    await useCase.execute();
  } catch (error) {
    thrownError = error;
  }

  assertTrue(Boolean(thrownError), 'execute should throw when API fails');
  assertTrue(context.window.SiteAdvogadaDomainError.isDomainError(thrownError), 'execute error should be DomainError');
  assertTrue(thrownError.code === 'ARTICLES_LOAD_FAILED', 'execute should throw ARTICLES_LOAD_FAILED code');
}

await testStaticFallbackFlow();
await testApiFallbackAndLikeFlow();
await testDomainErrorOnApiFailure();
console.log('PASS: articles.integration.test.mjs');

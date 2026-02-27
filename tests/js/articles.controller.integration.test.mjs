import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

class FakeClassList {
  constructor() {
    this.set = new Set();
  }

  add(value) {
    this.set.add(String(value));
  }

  remove(value) {
    this.set.delete(String(value));
  }

  toggle(value, force) {
    const key = String(value);
    if (typeof force === 'boolean') {
      if (force) this.set.add(key);
      else this.set.delete(key);
      return force;
    }
    if (this.set.has(key)) {
      this.set.delete(key);
      return false;
    }
    this.set.add(key);
    return true;
  }

  contains(value) {
    return this.set.has(String(value));
  }
}

class FakeButton {
  constructor({ key, articleId, articleSlug, likeInitial }) {
    this.dataset = {
      likeKey: key,
      articleId,
      likeInitial: String(likeInitial)
    };
    this.disabled = false;
    this.classList = new FakeClassList();
    this._likeCountEl = { textContent: String(likeInitial) };
    this._card = { dataset: { articleSlug } };
  }

  querySelector(selector) {
    if (selector === '.article-like-count') return this._likeCountEl;
    return null;
  }

  closest(selector) {
    if (selector === '.article-card') return this._card;
    return null;
  }

  get offsetWidth() {
    return 0;
  }
}

class FakeListElement {
  constructor() {
    this._html = '';
    this._buttons = [];
    this._viewsByKey = new Map();
    this._commentsByKey = new Map();
    this._buttonByKey = new Map();
    this._clickHandler = null;
  }

  set innerHTML(value) {
    this._html = String(value || '');
    this._parse();
  }

  get innerHTML() {
    return this._html;
  }

  _parse() {
    this._buttons = [];
    this._viewsByKey.clear();
    this._commentsByKey.clear();
    this._buttonByKey.clear();

    const slugByKey = new Map();
    const cardRegex = /data-article-key="([^"]*)"[^>]*data-article-id="([^"]*)"[^>]*data-article-slug="([^"]*)"/g;
    let cardMatch;
    while ((cardMatch = cardRegex.exec(this._html)) !== null) {
      slugByKey.set(cardMatch[1], cardMatch[3]);
    }

    const viewsRegex = /data-views-key="([^"]*)">([^<]*)</g;
    let viewsMatch;
    while ((viewsMatch = viewsRegex.exec(this._html)) !== null) {
      this._viewsByKey.set(viewsMatch[1], { textContent: String(viewsMatch[2]) });
    }

    const commentsRegex = /data-comments-key="([^"]*)">([^<]*)</g;
    let commentsMatch;
    while ((commentsMatch = commentsRegex.exec(this._html)) !== null) {
      this._commentsByKey.set(commentsMatch[1], { textContent: String(commentsMatch[2]) });
    }

    const buttonRegex = /data-like-btn[\s\S]*?data-article-id="([^"]*)"[\s\S]*?data-like-key="([^"]*)"[\s\S]*?data-like-initial="([^"]*)"/g;
    let buttonMatch;
    while ((buttonMatch = buttonRegex.exec(this._html)) !== null) {
      const articleId = buttonMatch[1];
      const key = buttonMatch[2];
      const likeInitial = Number.parseInt(buttonMatch[3], 10) || 0;
      const articleSlug = slugByKey.get(key) || '';
      const button = new FakeButton({ key, articleId, articleSlug, likeInitial });
      this._buttons.push(button);
      this._buttonByKey.set(key, button);
    }
  }

  querySelector(selector) {
    let match = selector.match(/^\[data-like-key="([^"]+)"\]$/);
    if (match) return this._buttonByKey.get(match[1]) || null;

    match = selector.match(/^\[data-views-key="([^"]+)"\]$/);
    if (match) return this._viewsByKey.get(match[1]) || null;

    match = selector.match(/^\[data-comments-key="([^"]+)"\]$/);
    if (match) return this._commentsByKey.get(match[1]) || null;

    return null;
  }

  querySelectorAll(selector) {
    if (selector === '[data-like-btn]') return this._buttons;
    return [];
  }

  addEventListener(eventName, handler) {
    if (eventName === 'click') this._clickHandler = handler;
  }

  async dispatchLikeClick(key) {
    if (!this._clickHandler) throw new Error('Click handler not registered');
    const button = this._buttonByKey.get(key);
    if (!button) throw new Error(`Button not found for key: ${key}`);

    const event = {
      target: {
        closest: (selector) => (selector === '[data-like-btn]' ? button : null)
      },
      preventDefault: () => {},
      stopPropagation: () => {}
    };

    await this._clickHandler(event);
    return button;
  }
}

class FakeDocument {
  constructor(statusEl, listEl) {
    this.elements = new Map([
      ['articles-status', statusEl],
      ['articles-list', listEl]
    ]);
  }

  getElementById(id) {
    return this.elements.get(id) || null;
  }
}

function loadScript(context, relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(source, context, { filename: fullPath });
}

async function createControllerHarness(sendLikeImpl) {
  const statusEl = { innerHTML: '', textContent: '' };
  const listEl = new FakeListElement();

  const context = {
    window: {},
    document: new FakeDocument(statusEl, listEl),
    CSS: { escape: (value) => String(value) },
    console,
    URLSearchParams
  };
  vm.createContext(context);

  loadScript(context, 'scripts/articles/domain/article.domain.js');
  loadScript(context, 'scripts/articles/domain/domain.error.js');
  loadScript(context, 'scripts/articles/ui/articles.controller.js');

  const domain = context.window.SiteAdvogadaArticlesDomain;
  const domainError = context.window.SiteAdvogadaDomainError;
  const controllerFactory = context.window.SiteAdvogadaArticlesController;

  let saveLikedCalls = 0;
  const storage = {
    likedStorage: {},
    readCachedMetrics: () => null,
    mergeCachedMetrics: () => {},
    saveLikedStorage: () => {
      saveLikedCalls += 1;
    },
    getFingerprint: () => 'fp-test-1'
  };

  const useCase = {
    execute: async () => ({
      items: [{
        _id: 'id-1',
        slug: 'slug-1',
        title: 'Artigo Teste',
        content: 'conteudo '.repeat(60),
        likes: 5
      }]
    }),
    syncCardMetrics: async () => ({}),
    sendLike: sendLikeImpl
  };

  const controller = controllerFactory.createArticlesController({
    useCase,
    storage,
    domain,
    domainError,
    config: {
      isPhpRuntime: true,
      apiBase: 'https://api.test',
      uploadsBase: 'https://api.test/uploads'
    }
  });

  await controller.start();

  return {
    listEl,
    storage,
    domainError,
    getSaveLikedCalls: () => saveLikedCalls
  };
}

async function testLikeSuccessFlow() {
  const harness = await createControllerHarness(async () => ({ likes: 8 }));
  const button = await harness.listEl.dispatchLikeClick('id-1');

  assertTrue(button.querySelector('.article-like-count').textContent === '8', 'like success should update counter with server value');
  assertTrue(button.classList.contains('is-liked'), 'like success should keep button liked');
  assertTrue(harness.storage.likedStorage['id-1'] === true, 'like success should persist liked state in storage');
}

async function testLikeRollbackOnDomainError() {
  const harness = await createControllerHarness(async () => {
    throw harnessDomainError('ARTICLES_LIKE_FAILED');
  });

  function harnessDomainError(code) {
    return harness.domainError.createDomainError(code, 'Erro de teste', {});
  }

  const button = await harness.listEl.dispatchLikeClick('id-1');

  assertTrue(button.querySelector('.article-like-count').textContent === '5', 'like failure should rollback optimistic counter');
  assertTrue(!button.classList.contains('is-liked'), 'like failure should rollback liked class');
  assertTrue(harness.storage.likedStorage['id-1'] === false, 'like failure should rollback storage liked state');
  assertTrue(harness.getSaveLikedCalls() >= 2, 'like failure should persist optimistic change and rollback');
}

await testLikeSuccessFlow();
await testLikeRollbackOnDomainError();
console.log('PASS: articles.controller.integration.test.mjs');

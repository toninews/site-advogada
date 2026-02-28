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

class FakeElement {
  constructor(name = 'element') {
    this.name = name;
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.listeners = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(handler);
  }

  dispatch(eventName, event = {}) {
    const handlers = this.listeners.get(eventName) || [];
    handlers.forEach((handler) => handler(event));
  }

  contains(target) {
    return target === this;
  }
}

class FakeSiteMenu extends FakeElement {
  constructor() {
    super('siteMenu');
    this.links = [new FakeElement('link1'), new FakeElement('link2')];
  }

  querySelectorAll(selector) {
    if (selector === 'a') return this.links;
    return [];
  }

  contains(target) {
    return target === this || this.links.includes(target);
  }
}

class FakeArticlesTarget {
  getBoundingClientRect() {
    return { top: 320 };
  }
}

class FakeDocument {
  constructor(elements) {
    this.elements = elements;
    this.listeners = new Map();
    this.hidden = false;
  }

  querySelector(selector) {
    return this.elements.get(selector) || null;
  }

  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(handler);
  }

  dispatch(eventName, event = {}) {
    const handlers = this.listeners.get(eventName) || [];
    handlers.forEach((handler) => handler(event));
  }
}

function loadScript(context, relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(source, context, { filename: fullPath });
}

const menuToggle = new FakeElement('menuToggle');
menuToggle.setAttribute('aria-expanded', 'false');
menuToggle.setAttribute('aria-label', 'Abrir menu');
const siteMenu = new FakeSiteMenu();
const articlesTarget = new FakeArticlesTarget();

const elements = new Map([
  ['.menu-toggle', menuToggle],
  ['.site-menu', siteMenu],
  ['#articles', articlesTarget]
]);

const fakeDocument = new FakeDocument(elements);
const windowListeners = new Map();
const scrollCalls = [];

const context = {
  window: {
    location: { hash: '#articles' },
    scrollY: 80,
    matchMedia: (query) => ({ matches: query === '(max-width: 47.99em)' }),
    addEventListener: (eventName, handler) => {
      if (!windowListeners.has(eventName)) windowListeners.set(eventName, []);
      windowListeners.get(eventName).push(handler);
    },
    dispatchEvent: (eventName, event = {}) => {
      const handlers = windowListeners.get(eventName) || [];
      handlers.forEach((handler) => handler(event));
    },
    scrollTo: (payload) => scrollCalls.push(payload),
    setTimeout,
    clearTimeout
  },
  document: fakeDocument,
  console,
  setTimeout,
  clearTimeout
};
vm.createContext(context);

loadScript(context, 'scripts/header/domain/header.domain.js');
loadScript(context, 'scripts/header/application/init-header-menu.usecase.js');
loadScript(context, 'scripts/header/ui/header.controller.js');

const domain = context.window.SiteAdvogadaHeaderDomain;
const useCaseFactory = context.window.SiteAdvogadaInitHeaderMenuUseCase;
const controllerFactory = context.window.SiteAdvogadaHeaderController;
const useCase = useCaseFactory.createInitHeaderMenuUseCase({ domain });
const controller = controllerFactory.createHeaderController({ useCase });
controller.start();

menuToggle.dispatch('click');
assertTrue(menuToggle.getAttribute('aria-expanded') === 'true', 'header controller should open menu on toggle click');
assertTrue(siteMenu.classList.contains('is-open'), 'header controller should add is-open class on toggle click');

siteMenu.links[0].dispatch('click');
assertTrue(menuToggle.getAttribute('aria-expanded') === 'false', 'header controller should close menu after mobile nav click');
assertTrue(!siteMenu.classList.contains('is-open'), 'header controller should remove is-open class after mobile nav click');

menuToggle.dispatch('click');
fakeDocument.dispatch('keydown', { key: 'Escape' });
assertTrue(menuToggle.getAttribute('aria-expanded') === 'false', 'header controller should close menu on Escape');

context.window.dispatchEvent('load');
await new Promise((resolve) => setTimeout(resolve, 0));
assertTrue(scrollCalls.length >= 1, 'header controller should adjust scroll on load when hash is #articles');
assertTrue(scrollCalls[0].top === 300, 'header controller should apply expected articles offset');

console.log('PASS: header.controller.integration.test.mjs');

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function assertTrue(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

class FakeClassList {
  constructor(initial = []) {
    this.set = new Set(initial.map(String));
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

class FakeImage {
  constructor() {
    this.loading = 'lazy';
  }

  decode() {
    return Promise.resolve();
  }
}

class FakeSlide {
  constructor(active = false) {
    this.classList = new FakeClassList(active ? ['active'] : []);
    this.image = new FakeImage();
  }

  querySelector(selector) {
    if (selector === 'img') return this.image;
    return null;
  }
}

class FakeDot {
  constructor(active = false) {
    this.classList = new FakeClassList(active ? ['active'] : []);
    this.listeners = new Map();
  }

  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(handler);
  }

  dispatch(eventName) {
    const handlers = this.listeners.get(eventName) || [];
    handlers.forEach((handler) => handler());
  }
}

class FakeButton {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(handler);
  }

  dispatch(eventName) {
    const handlers = this.listeners.get(eventName) || [];
    handlers.forEach((handler) => handler());
  }
}

class FakeCarouselElement {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(handler);
  }

  dispatch(eventName) {
    const handlers = this.listeners.get(eventName) || [];
    handlers.forEach((handler) => handler());
  }
}

class FakeDocument {
  constructor(slides, dots, indicator, carouselElement, prevButton, nextButton) {
    this.slides = slides;
    this.dots = dots;
    this.indicator = indicator;
    this.carouselElement = carouselElement;
    this.prevButton = prevButton;
    this.nextButton = nextButton;
    this.hidden = false;
    this.listeners = new Map();
  }

  querySelectorAll(selector) {
    if (selector === '.carousel-item') return this.slides;
    if (selector === '.pagination-button') return this.dots;
    return [];
  }

  querySelector(selector) {
    if (selector === '.pagination-current') return this.indicator;
    if (selector === '.carousel') return this.carouselElement;
    if (selector === '.prev') return this.prevButton;
    if (selector === '.next') return this.nextButton;
    return null;
  }

  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, []);
    this.listeners.get(eventName).push(handler);
  }

  dispatch(eventName) {
    const handlers = this.listeners.get(eventName) || [];
    handlers.forEach((handler) => handler());
  }
}

function loadScript(context, relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(source, context, { filename: fullPath });
}

const slides = [new FakeSlide(true), new FakeSlide(false), new FakeSlide(false)];
const dots = [new FakeDot(true), new FakeDot(false), new FakeDot(false)];
const indicator = { style: { transform: '' } };
const carouselElement = new FakeCarouselElement();
const prevButton = new FakeButton();
const nextButton = new FakeButton();
const fakeDocument = new FakeDocument(slides, dots, indicator, carouselElement, prevButton, nextButton);
const windowListeners = new Map();
const timeouts = [];
const idleCallbacks = [];

const context = {
  window: {
    addEventListener: (eventName, handler) => {
      if (!windowListeners.has(eventName)) windowListeners.set(eventName, []);
      windowListeners.get(eventName).push(handler);
    },
    dispatchEvent: (eventName) => {
      const handlers = windowListeners.get(eventName) || [];
      handlers.forEach((handler) => handler());
    },
    requestIdleCallback: (cb, options) => {
      idleCallbacks.push({ cb, options });
      return idleCallbacks.length;
    }
  },
  requestIdleCallback: (cb, options) => {
    idleCallbacks.push({ cb, options });
    return idleCallbacks.length;
  },
  document: fakeDocument,
  console,
  setTimeout: (cb, delay) => {
    timeouts.push({ cb, delay });
    return timeouts.length;
  },
  clearTimeout: () => {}
};
vm.createContext(context);

loadScript(context, 'scripts/carousel/domain/carousel.domain.js');
loadScript(context, 'scripts/carousel/application/init-carousel.usecase.js');
loadScript(context, 'scripts/carousel/ui/carousel.controller.js');

const domain = context.window.SiteAdvogadaCarouselDomain;
const useCaseFactory = context.window.SiteAdvogadaInitCarouselUseCase;
const controllerFactory = context.window.SiteAdvogadaCarouselController;
const useCase = useCaseFactory.createInitCarouselUseCase({ domain });
const controller = controllerFactory.createCarouselController({ useCase });
controller.start();

assertTrue(slides[0].classList.contains('active'), 'carousel should keep first slide active on start');
assertTrue(dots[0].classList.contains('active'), 'carousel should keep first dot active on start');
assertTrue(indicator.style.transform === 'translateX(calc(0 * var(--pagination-step)))', 'carousel should position indicator on first slide');
assertTrue(idleCallbacks.length === 1, 'carousel should schedule image warmup with requestIdleCallback when available');
assertTrue(timeouts.some((row) => row.delay === 3000), 'carousel should schedule autoplay timer');

nextButton.dispatch('click');
assertTrue(slides[1].classList.contains('active'), 'carousel should activate second slide on next click');
assertTrue(dots[1].classList.contains('active'), 'carousel should activate second dot on next click');
assertTrue(indicator.style.transform === 'translateX(calc(1 * var(--pagination-step)))', 'carousel should move indicator on next click');

prevButton.dispatch('click');
assertTrue(slides[0].classList.contains('active'), 'carousel should return to first slide on prev click');

dots[2].dispatch('click');
assertTrue(slides[2].classList.contains('active'), 'carousel should navigate to clicked dot slide');
assertTrue(dots[2].classList.contains('active'), 'carousel should activate clicked dot');

fakeDocument.hidden = true;
fakeDocument.dispatch('visibilitychange');

console.log('PASS: carousel.controller.integration.test.mjs');

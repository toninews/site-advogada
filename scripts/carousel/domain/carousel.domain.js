(function registerCarouselDomain(global) {
  function getAutoplayDelayMs() {
    return 3000;
  }

  function normalizeIndex(index, length) {
    if (!Number.isInteger(length) || length <= 0) return 0;
    return (index + length) % length;
  }

  function getWarmupDelayMs() {
    return 240;
  }

  function getIdleWarmupTimeoutMs() {
    return 1200;
  }

  function buildIndicatorTransform(index) {
    return `translateX(calc(${index} * var(--pagination-step)))`;
  }

  global.SiteAdvogadaCarouselDomain = {
    getAutoplayDelayMs,
    normalizeIndex,
    getWarmupDelayMs,
    getIdleWarmupTimeoutMs,
    buildIndicatorTransform
  };
})(window);

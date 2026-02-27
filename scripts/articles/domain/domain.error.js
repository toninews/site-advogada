(function registerDomainError(global) {
  class DomainError extends Error {
    constructor(code, message, details = {}) {
      super(message || 'Domain error');
      this.name = 'DomainError';
      this.code = String(code || 'DOMAIN_ERROR');
      this.details = details && typeof details === 'object' ? details : {};
    }
  }

  function createDomainError(code, message, details = {}) {
    return new DomainError(code, message, details);
  }

  function isDomainError(error) {
    return error instanceof DomainError || (error && error.name === 'DomainError' && typeof error.code === 'string');
  }

  global.SiteAdvogadaDomainError = {
    DomainError,
    createDomainError,
    isDomainError
  };
})(window);

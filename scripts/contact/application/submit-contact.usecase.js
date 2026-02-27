(function registerSubmitContactUseCase(global) {
  function createSubmitContactUseCase(deps) {
    const {
      domain,
      repository,
      domainError = {}
    } = deps;

    const createDomainError = domainError.createDomainError || ((code, message, details = {}) => {
      const error = new Error(message || 'Domain error');
      error.name = 'DomainError';
      error.code = code;
      error.details = details;
      return error;
    });

    async function execute(values) {
      const validation = domain.validatePayload(values || {});
      if (!validation.valid) {
        throw createDomainError(validation.code, validation.message, { field: 'form' });
      }

      const result = await repository.simulateSend(values);
      return {
        ok: Boolean(result && result.ok),
        message: String(result?.message || 'Mensagem enviada com sucesso.')
      };
    }

    return {
      execute
    };
  }

  global.SiteAdvogadaSubmitContactUseCase = {
    createSubmitContactUseCase
  };
})(window);

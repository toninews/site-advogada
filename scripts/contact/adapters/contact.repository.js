(function registerContactRepository(global) {
  function createContactRepository(config = {}) {
    const delayMs = Number.isFinite(Number(config.delayMs)) ? Number(config.delayMs) : 700;

    async function simulateSend(_payload) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return {
        ok: true,
        message: 'Mensagem simulada com sucesso. Este site é um modelo demonstrativo e não realiza envio real.'
      };
    }

    return {
      simulateSend
    };
  }

  global.SiteAdvogadaContactRepository = {
    createContactRepository
  };
})(window);

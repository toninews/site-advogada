(function registerAreasDomain(global) {
  function getFeedbackMessage() {
    return 'Em breve teremos páginas completas de cada área. Para atendimento imediato, use o WhatsApp ou o formulário de contato.';
  }

  function getClearDelayMs() {
    return 5200;
  }

  global.SiteAdvogadaAreasDomain = {
    getFeedbackMessage,
    getClearDelayMs
  };
})(window);

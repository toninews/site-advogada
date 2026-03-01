(function registerContactController(global) {
  function createContactController(deps) {
    const {
      domain,
      useCase,
      domainError = {}
    } = deps;

    const isDomainError = domainError.isDomainError || ((error) => Boolean(error && error.name === 'DomainError'));

    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('contact-feedback');
    const phoneInput = form ? form.querySelector('input[name="phone"]') : null;
    const mapFrame = document.querySelector('.contact-map-frame[data-src]');

    function setFeedback(message, isError = false) {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.classList.toggle('is-error', isError);
    }

    function loadMapFrame() {
      if (!mapFrame || mapFrame.src) return;
      mapFrame.src = mapFrame.dataset.src;
    }

    function bindLazyMap() {
      if (!mapFrame) return;

      if (!('IntersectionObserver' in global)) {
        loadMapFrame();
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (!entry || !entry.isIntersecting) return;
        loadMapFrame();
        observer.disconnect();
      }, {
        rootMargin: '240px 0px'
      });

      observer.observe(mapFrame);
    }

    function bindPhoneMask() {
      if (!phoneInput) return;
      phoneInput.addEventListener('input', () => {
        phoneInput.value = domain.formatPhone(phoneInput.value);
      });
      phoneInput.addEventListener('blur', () => {
        phoneInput.value = domain.formatPhone(phoneInput.value);
      });
    }

    function parseFormValues() {
      const data = new FormData(form);
      return Object.fromEntries(data.entries());
    }

    async function handleSubmit(event) {
      event.preventDefault();

      const values = parseFormValues();
      setFeedback('Enviando...');

      try {
        const result = await useCase.execute(values);
        setFeedback(result.message, !result.ok);
        if (result.ok) form.reset();
      } catch (error) {
        if (isDomainError(error)) {
          setFeedback(error.message || 'Não foi possível enviar a mensagem.', true);
        } else {
          setFeedback('Não foi possível enviar a mensagem agora.', true);
        }
      }
    }

    function start() {
      bindLazyMap();
      if (!form || !feedback) return;
      bindPhoneMask();
      form.addEventListener('submit', handleSubmit);
    }

    return { start };
  }

  global.SiteAdvogadaContactController = {
    createContactController
  };
})(window);

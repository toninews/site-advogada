(function registerContactDomain(global) {
  const REQUIRED_FIELDS = ['name', 'phone', 'email', 'area', 'message'];

  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatPhone(value) {
    const digits = normalizePhone(value).slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function validatePayload(values) {
    for (const field of REQUIRED_FIELDS) {
      if (!String(values[field] || '').trim()) {
        return { valid: false, code: 'CONTACT_REQUIRED_FIELDS', message: 'Preencha todos os campos obrigatórios.' };
      }
    }

    const phoneDigits = normalizePhone(values.phone);
    if (phoneDigits.length < 11) {
      return { valid: false, code: 'CONTACT_PHONE_INVALID', message: 'Informe um Celular / WhatsApp válido com DDD.' };
    }

    return { valid: true, code: 'CONTACT_VALID', message: '' };
  }

  global.SiteAdvogadaContactDomain = {
    REQUIRED_FIELDS,
    normalizePhone,
    formatPhone,
    validatePayload
  };
})(window);

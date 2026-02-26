<header class="container-fluid header-bg">
  <div class="row middle-xs between-xs header-row">
    <div class="col-xs-12 col-sm-3 start-xs brand-identity">
      <a href="/" class="logo">
        <img
          src="images/optimized/logo-horizontal-220.webp"
          srcset="images/optimized/logo-horizontal-220.webp 220w, images/optimized/logo-horizontal-320.webp 320w"
          sizes="(min-width: 48em) 280px, 200px"
          width="220"
          height="233"
          decoding="async"
          alt="Advogada Maria Silva - Direito Civil e Trabalhista"
        >
      </a>
      <a href="/" class="brand-name-header brand-name-header-link">Maria Silva Advocacia</a>
    </div>

    <div class="col-xs-12 col-sm-9 end-xs header-nav-wrap">
      <div class="header-top-info" aria-label="Informacoes de contato">
        <span class="header-top-item">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
          </svg>
          Itajaí-SC | Rua das Acácias, 245
        </span>
        <a class="header-top-item header-top-link" href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" aria-label="Conversar no WhatsApp">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11.2 11.2 0 0 0 3.5.56 1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.8 22 2 13.2 2 2.9a1 1 0 0 1 1-1h4.7a1 1 0 0 1 1 1c0 1.2.2 2.4.56 3.5a1 1 0 0 1-.24 1z" />
          </svg>
          (00) 00000-0000
        </a>
      </div>

      <button
        class="menu-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="primary-menu"
        aria-label="Abrir menu"
      >
        <span class="menu-toggle-bar"></span>
        <span class="menu-toggle-bar"></span>
        <span class="menu-toggle-bar"></span>
      </button>

      <nav class="site-nav" aria-label="Menu principal">
        <ul id="primary-menu" class="site-menu">
          <li><a href="#about"><span>&#9670;</span> Sobre</a></li>
          <li><a href="#history"><span>&#9670;</span> História</a></li>
          <li><a href="#areas"><span>&#9670;</span> Áreas de Atuação</a></li>
          <li><a href="#services"><span>&#9670;</span> Serviços</a></li>
          <li><a href="#articles"><span>&#9670;</span> Artigos</a></li>
          <li><a href="#contato"><span>&#9670;</span> Contato</a></li>
        </ul>
      </nav>
    </div>
  </div>
</header>

<script>
(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const siteMenu = document.querySelector('.site-menu');

  if (!menuToggle || !siteMenu) return;

  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    siteMenu.classList.remove('is-open');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    siteMenu.classList.toggle('is-open');
  });

  document.addEventListener('click', (event) => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;
    if (menuToggle.contains(event.target) || siteMenu.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  siteMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 47.99em)').matches) {
        closeMenu();
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 48em)').matches) {
      closeMenu();
    }
  });

  const adjustHashScroll = () => {
    if (window.location.hash !== '#articles') return;
    const target = document.querySelector('#articles');
    if (!target) return;
    const offset = 100;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'auto' });
  };

  window.addEventListener('load', () => {
    setTimeout(adjustHashScroll, 0);
  });

  window.addEventListener('hashchange', adjustHashScroll);
})();
</script>

<?php
$headerMenuPrefix = isset($headerMenuPrefix) ? (string)$headerMenuPrefix : '';
$headerHomeHref = isset($headerHomeHref) ? (string)$headerHomeHref : '/';
$headerBrandHref = isset($headerBrandHref) ? (string)$headerBrandHref : $headerHomeHref;
?>
<header class="container-fluid header-bg">
  <div class="row middle-xs between-xs header-row">
    <div class="col-xs-12 col-sm-3 start-xs brand-identity">
      <a href="<?php echo htmlspecialchars($headerHomeHref, ENT_QUOTES, 'UTF-8'); ?>" class="logo">
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
      <a href="<?php echo htmlspecialchars($headerBrandHref, ENT_QUOTES, 'UTF-8'); ?>" class="brand-name-header brand-name-header-link">Maria Silva Advocacia</a>
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
          <li><a href="<?php echo htmlspecialchars($headerMenuPrefix, ENT_QUOTES, 'UTF-8'); ?>#about"><span>&#9670;</span> Sobre</a></li>
          <li><a href="<?php echo htmlspecialchars($headerMenuPrefix, ENT_QUOTES, 'UTF-8'); ?>#history"><span>&#9670;</span> História</a></li>
          <li><a href="<?php echo htmlspecialchars($headerMenuPrefix, ENT_QUOTES, 'UTF-8'); ?>#areas"><span>&#9670;</span> Áreas de Atuação</a></li>
          <li><a href="<?php echo htmlspecialchars($headerMenuPrefix, ENT_QUOTES, 'UTF-8'); ?>#services"><span>&#9670;</span> Serviços</a></li>
          <li><a href="<?php echo htmlspecialchars($headerMenuPrefix, ENT_QUOTES, 'UTF-8'); ?>#articles"><span>&#9670;</span> Artigos</a></li>
          <li><a href="<?php echo htmlspecialchars($headerMenuPrefix, ENT_QUOTES, 'UTF-8'); ?>#contato"><span>&#9670;</span> Contato</a></li>
        </ul>
      </nav>
    </div>
  </div>
</header>

<script src="scripts/header/domain/header.domain.js" defer></script>
<script src="scripts/header/application/init-header-menu.usecase.js" defer></script>
<script src="scripts/header/ui/header.controller.js" defer></script>
<script src="scripts/header/app.js" defer></script>

<?php
declare(strict_types=1);

function esc($value): string {
  return htmlspecialchars((string)($value ?? ''), ENT_QUOTES, 'UTF-8');
}

require_once __DIR__ . '/app/article-detail/application/load-article-detail.usecase.php';
require_once __DIR__ . '/app/shared/domain/domain-error.php';

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$currentPath = strtok($_SERVER['REQUEST_URI'] ?? '/article-detail.php', '?');
$basePageUrl = $scheme . '://' . $host . $currentPath;

$isLocal = preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?$/', $host) === 1;
$apiBase = getenv('ARTICLES_API_BASE') ?: ($isLocal ? 'http://localhost:4010' : 'https://blog-back-n6z4.onrender.com');
$uploadsBase = $apiBase . '/uploads';

$articleDetail = [
  'article' => null,
  'fallbackTitle' => 'Artigo',
  'metaTitle' => 'Artigo',
  'metaDescription' => 'Artigo juridico da Maria Silva Advocacia.',
  'canonicalUrl' => $basePageUrl,
  'coverUrl' => '',
  'ogImage' => '',
  'publishedDate' => '',
  'readTime' => '1 min de leitura',
  'views' => 0,
  'likes' => 0,
  'pageTitle' => 'Artigo | Maria Silva Advocacia',
  'contentHtml' => '<p>Sem conteudo disponivel.</p>',
];

try {
  $articleDetail = load_article_detail_usecase([
    'apiBase' => $apiBase,
    'uploadsBase' => $uploadsBase,
    'articleId' => trim((string)($_GET['id'] ?? '')),
    'articleSlug' => trim((string)($_GET['slug'] ?? '')),
    'basePageUrl' => $basePageUrl,
  ], 'esc');
} catch (DomainError $e) {
  error_log('DomainError em article-detail.php: ' . $e->getCodeName() . ' - ' . $e->getMessage());
} catch (Throwable $e) {
  error_log('Erro inesperado em article-detail.php: ' . $e->getMessage());
}

$article = $articleDetail['article'];
$fallbackTitle = $articleDetail['fallbackTitle'];
$metaTitle = $articleDetail['metaTitle'];
$metaDescription = $articleDetail['metaDescription'];
$canonicalUrl = $articleDetail['canonicalUrl'];
$coverUrl = $articleDetail['coverUrl'];
$ogImage = $articleDetail['ogImage'];
$publishedDate = $articleDetail['publishedDate'];
$readTime = $articleDetail['readTime'];
$views = $articleDetail['views'];
$likes = $articleDetail['likes'];
$pageTitle = $articleDetail['pageTitle'];
$contentHtml = $articleDetail['contentHtml'];
?>
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <link rel="shortcut icon" href="favicon.svg" />
    <title><?php echo esc($pageTitle); ?></title>
    <meta name="description" content="<?php echo esc($metaDescription); ?>" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="<?php echo esc($canonicalUrl); ?>" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="<?php echo esc($metaTitle); ?>" />
    <meta property="og:description" content="<?php echo esc($metaDescription); ?>" />
    <meta property="og:url" content="<?php echo esc($canonicalUrl); ?>" />
    <?php if ($ogImage !== ''): ?>
    <meta property="og:image" content="<?php echo esc($ogImage); ?>" />
    <?php endif; ?>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="css/flexboxgrid.css" />
    <link rel="stylesheet" href="css/main.css?v=20260223a" />
    <style>
      body {
        background: #f5f5f5;
      }
      .article-page {
        max-width: 980px;
        margin: 0 auto;
        padding: 3.4rem 16px 2.2rem;
      }
      .article-page-top {
        margin-bottom: 1rem;
      }
      .article-back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: #1b4d3e;
        text-decoration: none;
        font-family: "Raleway", sans-serif;
        font-weight: 700;
      }
      .article-detail {
        background: #fff;
        border: 1px solid rgba(182, 135, 34, 0.4);
        border-radius: 14px;
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .article-detail-cover {
        width: 100%;
        max-height: min(56vh, 520px);
        object-fit: contain;
        background: #f0f0f0;
        display: block;
      }
      .article-detail-body {
        padding: 1.2rem 1.3rem 1.5rem;
      }
      .article-detail-title {
        margin: 0 0 0.7rem;
        color: #282828;
        line-height: 1.15;
      }
      .article-detail-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        margin: 0 0 1rem;
        color: #223830;
        font-family: "Raleway", sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
      }
      .article-detail-content p {
        margin: 0 0 1rem;
        line-height: 1.75;
        color: #282828;
      }
    </style>
  </head>
  <body>
    <header class="container-fluid header-bg">
      <div class="row middle-xs between-xs header-row">
        <div class="col-xs-12 col-sm-3 start-xs brand-identity">
          <a href="index.php" class="logo">
            <img
              src="images/optimized/logo-horizontal-220.webp"
              srcset="images/optimized/logo-horizontal-220.webp 220w, images/optimized/logo-horizontal-320.webp 320w"
              sizes="(min-width: 48em) 280px, 200px"
              width="220"
              height="233"
              decoding="async"
              alt="Advogada Maria Silva - Direito Civil e Trabalhista"
            />
          </a>
          <a href="index.php" class="brand-name-header brand-name-header-link">Maria Silva Advocacia</a>
        </div>

        <div class="col-xs-12 col-sm-9 end-xs header-nav-wrap">
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
              <li><a href="index.php#about"><span>&#9670;</span> Sobre</a></li>
              <li><a href="index.php#history"><span>&#9670;</span> História</a></li>
              <li><a href="index.php#areas"><span>&#9670;</span> Áreas de Atuação</a></li>
              <li><a href="index.php#services"><span>&#9670;</span> Serviços</a></li>
              <li><a href="index.php#articles"><span>&#9670;</span> Artigos</a></li>
              <li><a href="index.php#contato"><span>&#9670;</span> Contato</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>

    <main class="article-page" aria-labelledby="article-title">
      <div class="article-page-top">
        <a class="article-back-link" href="index.php#articles">&larr; Voltar para os artigos</a>
      </div>

      <?php if (!$article): ?>
      <div id="article-status">Artigo não encontrado.</div>
      <?php else: ?>
      <article id="article-detail" class="article-detail">
        <?php if ($coverUrl !== ''): ?>
        <img id="article-cover" class="article-detail-cover" alt="<?php echo esc($fallbackTitle); ?>" src="<?php echo esc($coverUrl); ?>" />
        <?php endif; ?>
        <div class="article-detail-body">
          <h1 id="article-title" class="article-detail-title"><?php echo esc($fallbackTitle); ?></h1>
          <div id="article-meta" class="article-detail-meta">
            <span><?php echo $publishedDate !== '' ? 'Publicado em ' . esc($publishedDate) : ''; ?></span>
            <span><?php echo esc($readTime); ?></span>
            <span><?php echo esc((string)$views); ?> visualizações</span>
            <span><?php echo esc((string)$likes); ?> curtidas</span>
          </div>
          <div id="article-content" class="article-detail-content"><?php echo $contentHtml; ?></div>
        </div>
      </article>
      <?php endif; ?>
    </main>

    <?php include 'footer.php'; ?>

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
          if (event.key === 'Escape') closeMenu();
        });

        siteMenu.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 47.99em)').matches) closeMenu();
          });
        });

        window.addEventListener('resize', () => {
          if (window.matchMedia('(min-width: 48em)').matches) closeMenu();
        });
      })();
    </script>
  </body>
</html>

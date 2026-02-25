#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"
mkdir -p artigos
export PROJECT_ROOT

cat > index.html <<'HTML_HEAD'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Advogada Maria Silva | Direito Civil e Trabalhista</title>
  <meta name="description" content="Advogada Maria Silva especializada em Direito Civil e Trabalhista. Atendimento jurídico com foco em orientação clara e estratégia eficiente.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="https://site-advogada-eosin.vercel.app/">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Advogada Maria Silva | Direito Civil e Trabalhista">
  <meta property="og:description" content="Atendimento jurídico em Direito Civil e Trabalhista com abordagem personalizada.">
  <meta property="og:url" content="https://site-advogada-eosin.vercel.app/">
  <meta name="twitter:card" content="summary">
  <style>
    .header-bg { background: linear-gradient(135deg, #282828, #1b4d3e); min-height: 82px; }
    .site-footer { background: #223830; color: #f5f5f5; }
    .footer-social { display: flex; gap: 10px; align-items: center; }
    .footer-social-link { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; }
    .footer-social-link svg { width: 18px; height: 18px; display: block; }
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://www.google.com">
  <link rel="preconnect" href="https://maps.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/flexboxgrid.css">
  <link rel="stylesheet" href="css/main.css?v=20260223a">
  <script>window.__SITE_RUNTIME__ = "static";</script>
</head>
<body>
HTML_HEAD

cat header.php >> index.html
cat carousel.php >> index.html
cat about.php >> index.html
cat history.php >> index.html
cat areas.php >> index.html
cat services.php >> index.html
cat articles.php >> index.html
cat contact.php >> index.html
cat footer.php >> index.html

cat >> index.html <<'HTML_FOOT'
</body>
</html>
HTML_FOOT

node ./scripts/generate-static-articles.mjs

echo "index.html atualizado com sucesso."

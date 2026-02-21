#!/usr/bin/env bash
set -euo pipefail

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
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/flexboxgrid.css">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
HTML_HEAD

cat header.php >> index.html
cat carousel.php >> index.html
cat about.php >> index.html
cat history.php >> index.html
cat areas.php >> index.html
cat services.php >> index.html
cat footer.php >> index.html

cat >> index.html <<'HTML_FOOT'
</body>
</html>
HTML_FOOT

echo "index.html atualizado com sucesso."

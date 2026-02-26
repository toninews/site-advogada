<?php
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$canonical = $scheme . '://' . $host . '/';
$ogImage = $scheme . '://' . $host . '/images/optimized/partners-1200.webp';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Advogada Maria Silva | Direito Civil e Trabalhista</title>
  <meta name="description" content="Advogada Maria Silva especializada em Direito Civil e Trabalhista. Atendimento jurídico com foco em orientação clara e estratégia eficiente.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="<?php echo htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Advogada Maria Silva | Direito Civil e Trabalhista">
  <meta property="og:description" content="Atendimento jurídico em Direito Civil e Trabalhista com abordagem personalizada.">
  <meta property="og:url" content="<?php echo htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="og:image" content="<?php echo htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="<?php echo htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8'); ?>">
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
  <script>window.__SITE_RUNTIME__ = "php";</script>
</head>
<body>
  <?php include 'header.php'; ?>
  <?php include 'carousel.php'; ?>
  <?php include 'about.php'; ?>
  <?php include 'history.php'; ?>
  <?php include 'areas.php'; ?>
  <?php include 'services.php'; ?>
  <?php include 'articles.php'; ?>
  <?php include 'contact.php'; ?>
  <?php include 'footer.php'; ?>
</body>
</html>

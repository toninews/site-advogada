<?php
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$canonical = $scheme . '://' . $host . '/';
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
  <meta name="twitter:card" content="summary">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/flexboxgrid.css">
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <?php include 'header.php'; ?>
  <?php include 'carousel.php'; ?>
  <?php include 'about.php'; ?>
  <?php include 'history.php'; ?>
  <?php include 'areas.php'; ?>
  <?php include 'services.php'; ?>
  <?php include 'footer.php'; ?>
</body>
</html>

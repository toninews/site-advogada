<?php
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$canonical = $scheme . '://' . $host . '/';
$ogImage = $scheme . '://' . $host . '/images/optimized/partners-1200.webp';
$headTemplate = file_get_contents(__DIR__ . '/templates/home-head.template.html');
if ($headTemplate === false) {
  http_response_code(500);
  exit('Template da home não encontrado.');
}
$headHtml = strtr($headTemplate, [
  '{{SITE_RUNTIME}}' => 'php',
  '{{CANONICAL_URL}}' => htmlspecialchars($canonical, ENT_QUOTES, 'UTF-8'),
  '{{OG_IMAGE_URL}}' => htmlspecialchars($ogImage, ENT_QUOTES, 'UTF-8'),
]);
?>
<?php echo $headHtml; ?>
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

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

php <<'PHP'
<?php
declare(strict_types=1);

function fetchJson(string $url): ?array {
  if (!filter_var($url, FILTER_VALIDATE_URL)) return null;

  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT => 12,
      CURLOPT_CONNECTTIMEOUT => 5,
      CURLOPT_HTTPHEADER => ['Accept: application/json'],
      CURLOPT_USERAGENT => 'site-advogada-static-build/1.0',
    ]);
    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($response === false || $status < 200 || $status >= 300) return null;
  } else {
    $ctx = stream_context_create([
      'http' => [
        'method' => 'GET',
        'timeout' => 12,
        'header' => "Accept: application/json\r\nUser-Agent: site-advogada-static-build/1.0\r\n",
      ],
    ]);
    $response = @file_get_contents($url, false, $ctx);
    if ($response === false) return null;
  }

  $decoded = json_decode((string)$response, true);
  return is_array($decoded) ? $decoded : null;
}

function esc(string $value): string {
  return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function slugify(string $value): string {
  $v = trim(mb_strtolower($value, 'UTF-8'));
  $v = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $v) ?: $v;
  $v = preg_replace('/[^a-z0-9]+/', '-', $v) ?? '';
  $v = trim($v, '-');
  return $v !== '' ? $v : 'artigo';
}

function resolveMediaUrl(string $value, string $apiBase, string $uploadsBase): string {
  $raw = trim($value);
  if ($raw === '') return '';
  if (preg_match('#^https?://#i', $raw)) return $raw;
  if (str_starts_with($raw, '/uploads/')) return $apiBase . $raw;
  if (str_starts_with($raw, 'uploads/')) return $apiBase . '/' . $raw;
  return $uploadsBase . '/' . rawurlencode($raw);
}

function excerpt(string $content, int $max = 160): string {
  $plain = trim(preg_replace('/\s+/', ' ', strip_tags($content)) ?? '');
  if ($plain === '') return 'Artigo jurídico da Maria Silva Advocacia.';
  if (mb_strlen($plain, 'UTF-8') <= $max) return $plain;
  return rtrim(mb_substr($plain, 0, $max, 'UTF-8')) . '...';
}

function formatDate(?string $value): string {
  if (!$value) return '';
  try {
    $d = new DateTime($value);
  } catch (Exception $e) {
    return '';
  }
  return $d->format('d/m/Y');
}

function readTime(string $content): string {
  $plain = trim(preg_replace('/\s+/', ' ', strip_tags($content)) ?? '');
  if ($plain === '') return '1 min de leitura';
  $count = count(preg_split('/\s+/', $plain) ?: []);
  return max(1, (int)round($count / 220)) . ' min de leitura';
}

function renderContentHtml(string $content): string {
  $trimmed = trim($content);
  if ($trimmed === '') return '<p>Sem conteúdo disponível.</p>';
  $parts = preg_split('/\n\s*\n/', $trimmed) ?: [];
  $html = '';
  foreach ($parts as $part) {
    $line = nl2br(esc(trim($part)));
    if ($line !== '') $html .= '<p>' . $line . '</p>';
  }
  return $html !== '' ? $html : '<p>Sem conteúdo disponível.</p>';
}

function rrmdir(string $dir): void {
  if (!is_dir($dir)) return;
  $items = scandir($dir);
  if (!is_array($items)) return;
  foreach ($items as $item) {
    if ($item === '.' || $item === '..') continue;
    $path = $dir . DIRECTORY_SEPARATOR . $item;
    if (is_dir($path)) rrmdir($path);
    else @unlink($path);
  }
  @rmdir($dir);
}

$apiBase = getenv('ARTICLES_API_BASE') ?: 'https://blog-back-n6z4.onrender.com';
$siteBase = rtrim((string)(getenv('SITE_BASE_URL') ?: 'https://site-advogada-eosin.vercel.app'), '/');
$uploadsBase = $apiBase . '/uploads';
$projectRoot = getenv('PROJECT_ROOT') ?: (getcwd() ?: '.');
$articlesDir = $projectRoot . '/artigos';

$payload = fetchJson($apiBase . '/articles?status=published&limit=200');
$items = [];
if (is_array($payload)) {
  if (isset($payload['data']) && is_array($payload['data'])) $items = $payload['data'];
  elseif (isset($payload[0]) && is_array($payload[0])) $items = $payload;
}

rrmdir($articlesDir);
@mkdir($articlesDir, 0775, true);

if (!$items) {
  fwrite(STDERR, "Aviso: nenhum artigo retornado pela API. Pasta /artigos gerada vazia.\n");
  exit(0);
}

$usedSlugs = [];
$written = 0;

foreach ($items as $item) {
  if (!is_array($item)) continue;

  $id = trim((string)($item['_id'] ?? ''));
  $title = trim((string)($item['title'] ?? 'Artigo'));
  $content = (string)($item['content'] ?? '');
  $slugRaw = trim((string)($item['slug'] ?? ''));
  $slug = $slugRaw !== '' ? slugify($slugRaw) : slugify(($id !== '' ? 'id-' . $id : $title));
  if ($slug === '') $slug = 'artigo';
  $baseSlug = $slug;
  $suffix = 2;
  while (isset($usedSlugs[$slug])) {
    $slug = $baseSlug . '-' . $suffix;
    $suffix++;
  }
  $usedSlugs[$slug] = true;

  $seo = is_array($item['seo'] ?? null) ? $item['seo'] : [];
  $metaTitle = trim((string)($seo['metaTitle'] ?? '')) ?: $title;
  $metaDescription = trim((string)($seo['metaDescription'] ?? '')) ?: excerpt($content);
  $canonical = trim((string)($seo['canonicalUrl'] ?? ''));
  if ($canonical === '') $canonical = $siteBase . '/artigos/' . rawurlencode($slug) . '/';

  $coverUrl = resolveMediaUrl((string)($item['coverImage'] ?? ''), $apiBase, $uploadsBase);
  $ogImage = resolveMediaUrl((string)($seo['ogImage'] ?? ''), $apiBase, $uploadsBase);
  if ($ogImage === '') $ogImage = $coverUrl;

  $published = formatDate((string)($item['publishedAt'] ?? $item['createdAt'] ?? $item['updatedAt'] ?? ''));
  $views = (int)($item['views'] ?? $item['viewCount'] ?? 0);
  $likes = (int)($item['likes'] ?? $item['likesCount'] ?? 0);
  $time = readTime($content);
  $contentHtml = renderContentHtml($content);
  $pageTitle = $metaTitle . ' | Maria Silva Advocacia';

  $targetDir = $articlesDir . '/' . $slug;
  @mkdir($targetDir, 0775, true);
  $targetFile = $targetDir . '/index.html';

  $html = '<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>' . esc($pageTitle) . '</title>
    <meta name="description" content="' . esc($metaDescription) . '" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="' . esc($canonical) . '" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="' . esc($metaTitle) . '" />
    <meta property="og:description" content="' . esc($metaDescription) . '" />
    <meta property="og:url" content="' . esc($canonical) . '" />' .
    ($ogImage !== '' ? '
    <meta property="og:image" content="' . esc($ogImage) . '" />' : '') . '
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/css/flexboxgrid.css" />
    <link rel="stylesheet" href="/css/main.css?v=20260223a" />
    <style>
      body { background: #f5f5f5; }
      .article-page { max-width: 980px; margin: 0 auto; padding: 3.4rem 16px 2.2rem; }
      .article-page-top { margin-bottom: 1rem; }
      .article-back-link { display: inline-flex; align-items: center; gap: 0.4rem; color: #1b4d3e; text-decoration: none; font-family: "Raleway", sans-serif; font-weight: 700; }
      .article-detail { background: #fff; border: 1px solid rgba(182, 135, 34, 0.4); border-radius: 14px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.1); overflow: hidden; }
      .article-detail-cover { width: 100%; max-height: min(56vh, 520px); object-fit: contain; background: #f0f0f0; display: block; }
      .article-detail-body { padding: 1.2rem 1.3rem 1.5rem; }
      .article-detail-title { margin: 0 0 0.7rem; color: #282828; line-height: 1.15; }
      .article-detail-meta { display: flex; flex-wrap: wrap; gap: 0.8rem; margin: 0 0 1rem; color: #223830; font-family: "Raleway", sans-serif; font-size: 0.9rem; font-weight: 600; }
      .article-detail-content p { margin: 0 0 1rem; line-height: 1.75; color: #282828; }
    </style>
  </head>
  <body>
    <main class="article-page" aria-labelledby="article-title">
      <div class="article-page-top">
        <a class="article-back-link" href="/#articles">&larr; Voltar para os artigos</a>
      </div>
      <article class="article-detail">
        ' . ($coverUrl !== '' ? '<img class="article-detail-cover" alt="' . esc($title) . '" src="' . esc($coverUrl) . '" />' : '') . '
        <div class="article-detail-body">
          <h1 id="article-title" class="article-detail-title">' . esc($title) . '</h1>
          <div class="article-detail-meta">
            <span>' . ($published !== '' ? 'Publicado em ' . esc($published) : '') . '</span>
            <span>' . esc($time) . '</span>
            <span>' . esc((string)$views) . ' visualizações</span>
            <span>' . esc((string)$likes) . ' curtidas</span>
          </div>
          <div class="article-detail-content">' . $contentHtml . '</div>
        </div>
      </article>
    </main>
  </body>
</html>';

  file_put_contents($targetFile, $html);
  $written++;
}

fwrite(STDOUT, "Artigos estáticos gerados: {$written}\n");
PHP

echo "index.html atualizado com sucesso."

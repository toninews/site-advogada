<?php

declare(strict_types=1);

function article_detail_is_assoc_array($value): bool {
  return is_array($value) && array_keys($value) !== range(0, count($value) - 1);
}

function article_detail_normalize_article($payload): ?array {
  if (!is_array($payload) || !$payload) return null;

  if (article_detail_is_assoc_array($payload) && isset($payload['title'])) {
    return $payload;
  }

  if (isset($payload['data']) && is_array($payload['data'])) {
    if (article_detail_is_assoc_array($payload['data']) && isset($payload['data']['title'])) {
      return $payload['data'];
    }
    if (isset($payload['data'][0]) && is_array($payload['data'][0])) {
      return $payload['data'][0];
    }
  }

  if (isset($payload[0]) && is_array($payload[0])) {
    return $payload[0];
  }

  return null;
}

function article_detail_resolve_media_url($value, string $apiBase, string $uploadsBase): string {
  $raw = trim((string)$value);
  if ($raw === '') return '';

  if (preg_match('#^https?://#i', $raw)) return $raw;
  if (strpos($raw, '/uploads/') === 0) return $apiBase . $raw;
  if (strpos($raw, 'uploads/') === 0) return $apiBase . '/' . $raw;
  return $uploadsBase . '/' . rawurlencode($raw);
}

function article_detail_excerpt_from_content($content, int $max = 160): string {
  $plain = trim((string)preg_replace('/\s+/', ' ', strip_tags((string)$content)));
  if ($plain === '') return 'Artigo juridico da Maria Silva Advocacia.';
  if (mb_strlen($plain, 'UTF-8') <= $max) return $plain;
  return rtrim((string)mb_substr($plain, 0, $max, 'UTF-8')) . '...';
}

function article_detail_format_article_date($value): string {
  if (!$value) return '';
  try {
    $date = new DateTime((string)$value);
  } catch (Exception $e) {
    return '';
  }
  return $date->format('d/m/Y');
}

function article_detail_estimate_read_time($content): string {
  $plain = trim((string)preg_replace('/\s+/', ' ', strip_tags((string)$content)));
  if ($plain === '') return '1 min de leitura';
  $wordCount = count(preg_split('/\s+/', $plain));
  $minutes = max(1, (int)round($wordCount / 220));
  return $minutes . ' min de leitura';
}

function article_detail_sanitize_article_html($content): string {
  $html = trim((string)$content);
  if ($html === '') return '';

  $html = (string)preg_replace('#<(script|style)\b[^>]*>.*?</\1>#is', '', $html);
  $allowed = ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'blockquote', 'h2', 'h3'];
  $allowedTags = '<' . implode('><', $allowed) . '>';
  $html = strip_tags($html, $allowedTags);
  $html = (string)preg_replace_callback('/<(\/?)([a-z0-9]+)(?:\s[^>]*)?>/i', function($m) use ($allowed) {
    $tag = strtolower($m[2]);
    if (!in_array($tag, $allowed, true)) return '';
    return '<' . $m[1] . $tag . '>';
  }, $html);

  return trim($html);
}

function article_detail_build_content_html(callable $esc, ?array $article): string {
  $contentHtml = '';
  if ($article && isset($article['content'])) {
    $rawContent = trim((string)$article['content']);
    if (preg_match('/<[^>]+>/', $rawContent)) {
      $contentHtml = article_detail_sanitize_article_html($rawContent);
    } else {
      $parts = preg_split('/\n\s*\n/', $rawContent) ?: [];
      foreach ($parts as $p) {
        $line = nl2br($esc(trim((string)$p)));
        if ($line !== '') $contentHtml .= '<p>' . $line . '</p>';
      }
    }
    if ($contentHtml === '') $contentHtml = '<p>Sem conteudo disponivel.</p>';
  }

  return $contentHtml;
}

function article_detail_pick_count(?array $article, array $paths): int {
  if (!$article) return 0;

  foreach ($paths as $path) {
    $parts = explode('.', $path);
    $current = $article;
    foreach ($parts as $part) {
      if (!is_array($current) || !array_key_exists($part, $current)) {
        $current = null;
        break;
      }
      $current = $current[$part];
    }

    if (is_numeric($current)) {
      return (int)$current;
    }
  }

  return 0;
}

<?php

declare(strict_types=1);

require_once __DIR__ . '/../domain/article-detail.domain.php';
require_once __DIR__ . '/../adapters/article-http.repository.php';
require_once __DIR__ . '/../../shared/domain/domain-error.php';

function load_article_detail_usecase(array $input, callable $esc): array {
  $apiBase = trim((string)($input['apiBase'] ?? ''));
  if ($apiBase === '') {
    throw new DomainError('ARTICLE_API_BASE_REQUIRED', 'A base da API de artigos e obrigatoria.', 500, [
      'field' => 'apiBase'
    ]);
  }

  $uploadsBase = $input['uploadsBase'] ?? ($apiBase . '/uploads');
  $articleId = trim((string)($input['articleId'] ?? ''));
  $articleSlug = trim((string)($input['articleSlug'] ?? ''));
  $basePageUrl = trim((string)($input['basePageUrl'] ?? ''));
  $fetchJson = $input['fetchJson'] ?? 'article_detail_fetch_json';
  if (!is_callable($fetchJson)) {
    throw new DomainError('ARTICLE_FETCH_STRATEGY_INVALID', 'Estrategia de busca de artigo invalida.', 500, [
      'field' => 'fetchJson'
    ]);
  }

  $article = null;

  if ($articleId !== '') {
    $payload = $fetchJson($apiBase . '/articles/' . rawurlencode($articleId));
    $article = article_detail_normalize_article($payload);
  }

  if (!$article && $articleSlug !== '') {
    $slugAttempts = [
      $apiBase . '/articles/slug/' . rawurlencode($articleSlug),
      $apiBase . '/articles/by-slug/' . rawurlencode($articleSlug),
      $apiBase . '/articles?status=published&slug=' . rawurlencode($articleSlug) . '&limit=1',
    ];

    foreach ($slugAttempts as $url) {
      $payload = $fetchJson($url);
      $article = article_detail_normalize_article($payload);
      if ($article) break;
    }
  }

  $seo = is_array($article['seo'] ?? null) ? $article['seo'] : [];
  $fallbackTitle = $article['title'] ?? 'Artigo';
  $metaTitle = trim((string)($seo['metaTitle'] ?? '')) ?: trim((string)$fallbackTitle);
  $metaDescription = trim((string)($seo['metaDescription'] ?? '')) ?: article_detail_excerpt_from_content($article['content'] ?? '');

  $canonicalUrl = trim((string)($seo['canonicalUrl'] ?? ''));
  if ($canonicalUrl === '') {
    $slug = trim((string)($article['slug'] ?? $articleSlug));
    if ($slug !== '') {
      $canonicalUrl = $basePageUrl . '?slug=' . rawurlencode($slug);
    } elseif ($articleId !== '') {
      $canonicalUrl = $basePageUrl . '?id=' . rawurlencode($articleId);
    } else {
      $canonicalUrl = $basePageUrl;
    }
  }

  $coverUrl = article_detail_resolve_media_url($article['coverImage'] ?? '', $apiBase, $uploadsBase);
  $ogImage = article_detail_resolve_media_url($seo['ogImage'] ?? '', $apiBase, $uploadsBase);
  if ($ogImage === '') $ogImage = $coverUrl;

  $publishedDate = article_detail_format_article_date($article['publishedAt'] ?? $article['createdAt'] ?? $article['updatedAt'] ?? '');
  $readTime = article_detail_estimate_read_time($article['content'] ?? '');

  $views = article_detail_pick_count($article, [
    'views',
    'viewCount',
    'viewsCount',
    'totalViews',
    'stats.views',
    'stats.viewCount',
    'metrics.views',
    'metrics.viewCount',
    'counters.views',
    'counters.viewCount',
    'statistics.views',
    'analytics.views',
    'data.views',
    'data.viewCount',
    'article.views',
    'article.viewCount',
    'result.views',
    'result.viewCount'
  ]);

  $likes = article_detail_pick_count($article, [
    'likes',
    'likesCount',
    'stats.likes',
    'metrics.likes',
    'counters.likes',
    'data.likes',
    'data.likesCount',
    'article.likes',
    'article.likesCount',
    'result.likes',
    'result.likesCount'
  ]);

  $pageTitle = ($metaTitle !== '' ? $metaTitle : 'Artigo') . ' | Maria Silva Advocacia';
  $contentHtml = article_detail_build_content_html($esc, $article);

  return [
    'article' => $article,
    'fallbackTitle' => $fallbackTitle,
    'metaTitle' => $metaTitle,
    'metaDescription' => $metaDescription,
    'canonicalUrl' => $canonicalUrl,
    'coverUrl' => $coverUrl,
    'ogImage' => $ogImage,
    'publishedDate' => $publishedDate,
    'readTime' => $readTime,
    'views' => $views,
    'likes' => $likes,
    'pageTitle' => $pageTitle,
    'contentHtml' => $contentHtml,
  ];
}

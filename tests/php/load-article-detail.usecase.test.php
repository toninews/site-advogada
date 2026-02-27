<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/article-detail/application/load-article-detail.usecase.php';

function assert_true(bool $condition, string $message): void {
  if (!$condition) {
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
  }
}

$fetchCalls = [];
$fetchJson = function(string $url) use (&$fetchCalls): ?array {
  $fetchCalls[] = $url;

  if (strpos($url, '/articles/slug/slug-teste') !== false) {
    return [
      'title' => 'Slug Article',
      'slug' => 'slug-teste',
      'content' => '<p>Conteudo de teste com texto suficiente.</p>',
      'stats' => ['views' => 45],
      'metrics' => ['likes' => 12],
      'seo' => [
        'metaTitle' => 'Meta Slug',
        'metaDescription' => 'Descricao via SEO'
      ]
    ];
  }

  if (strpos($url, '/articles/abc123') !== false) {
    return [
      'title' => 'Id Article',
      'slug' => 'id-article',
      'content' => 'Paragrafo simples',
      'views' => 99,
      'likes' => 8
    ];
  }

  return null;
};

$resultBySlug = load_article_detail_usecase([
  'apiBase' => 'https://api.test',
  'uploadsBase' => 'https://api.test/uploads',
  'articleSlug' => 'slug-teste',
  'basePageUrl' => 'https://site.test/artigo.php',
  'fetchJson' => $fetchJson,
], fn($v) => htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'));

assert_true(($resultBySlug['metaTitle'] ?? '') === 'Meta Slug', 'usecase should use SEO meta title when available');
assert_true(($resultBySlug['views'] ?? 0) === 45, 'usecase should resolve views from fallback metric paths');
assert_true(($resultBySlug['likes'] ?? 0) === 12, 'usecase should resolve likes from fallback metric paths');
assert_true(strpos((string)$resultBySlug['canonicalUrl'], 'slug=slug-teste') !== false, 'usecase should build canonical by slug');

$resultById = load_article_detail_usecase([
  'apiBase' => 'https://api.test',
  'articleId' => 'abc123',
  'basePageUrl' => 'https://site.test/artigo.php',
  'fetchJson' => $fetchJson,
], fn($v) => htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'));

assert_true(($resultById['views'] ?? 0) === 99, 'usecase should resolve direct views field');
assert_true(($resultById['likes'] ?? 0) === 8, 'usecase should resolve direct likes field');
assert_true(strpos((string)$resultById['canonicalUrl'], 'slug=id-article') !== false, 'usecase should prioritize slug for canonical when found');
assert_true(!empty($fetchCalls), 'usecase should call fetch function');

// Should throw DomainError when apiBase is missing.
$threwDomainError = false;
try {
  load_article_detail_usecase([
    'articleId' => 'abc123',
    'basePageUrl' => 'https://site.test/artigo.php',
    'fetchJson' => $fetchJson,
  ], fn($v) => htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'));
} catch (DomainError $e) {
  $threwDomainError = ($e->getCodeName() === 'ARTICLE_API_BASE_REQUIRED');
}
assert_true($threwDomainError, 'usecase should throw ARTICLE_API_BASE_REQUIRED when apiBase is empty');

fwrite(STDOUT, "PASS: load-article-detail.usecase.test.php\n");

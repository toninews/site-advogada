<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/article-detail/domain/article-detail.domain.php';

function assert_true(bool $condition, string $message): void {
  if (!$condition) {
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
  }
}

$normalized = article_detail_normalize_article(['data' => [['title' => 'A']]]);
assert_true(is_array($normalized) && ($normalized['title'] ?? '') === 'A', 'normalize_article should resolve nested data payload');

$sanitized = article_detail_sanitize_article_html('<h2>Titulo</h2><script>alert(1)</script><p>Texto</p>');
assert_true(strpos($sanitized, '<script') === false, 'sanitize should remove script tags');
assert_true(strpos($sanitized, '<h2>Titulo</h2>') !== false, 'sanitize should keep allowed tags');

$count = article_detail_pick_count(['stats' => ['views' => '17']], ['stats.views', 'views']);
assert_true($count === 17, 'pick_count should parse nested numeric values');

$excerpt = article_detail_excerpt_from_content('<p>Texto de teste para resumo.</p>', 10);
assert_true(substr($excerpt, -3) === '...', 'excerpt should truncate with ellipsis');

fwrite(STDOUT, "PASS: article-detail.domain.test.php\n");

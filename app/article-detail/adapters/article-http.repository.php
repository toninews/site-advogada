<?php

declare(strict_types=1);

function article_detail_fetch_json(string $url): ?array {
  if (!filter_var($url, FILTER_VALIDATE_URL)) return null;

  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT => 8,
      CURLOPT_CONNECTTIMEOUT => 4,
      CURLOPT_HTTPHEADER => ['Accept: application/json'],
      CURLOPT_USERAGENT => 'site-advogada-article-ssr/1.0',
    ]);
    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response === false || $status < 200 || $status >= 300) {
      return null;
    }
  } else {
    $context = stream_context_create([
      'http' => [
        'method' => 'GET',
        'timeout' => 8,
        'header' => "Accept: application/json\r\nUser-Agent: site-advogada-article-ssr/1.0\r\n",
      ],
    ]);

    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
      return null;
    }
  }

  $decoded = json_decode($response, true);
  return is_array($decoded) ? $decoded : null;
}

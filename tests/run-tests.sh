#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running PHP tests..."
php tests/php/domain-error.test.php
php tests/php/article-detail.domain.test.php
php tests/php/load-article-detail.usecase.test.php

echo "Running JS tests..."
node tests/js/domain.error.test.mjs
node tests/js/articles.domain.test.mjs
node tests/js/articles.integration.test.mjs
node tests/js/articles.controller.integration.test.mjs

echo "All tests passed."

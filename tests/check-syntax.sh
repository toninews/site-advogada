#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Checking PHP syntax..."
while IFS= read -r file; do
  php -l "$file" >/dev/null
done < <(find . -type f -name '*.php' \
  -not -path './artigos/*' \
  -not -path './.git/*' \
  | sort)

echo "Checking JS syntax..."
while IFS= read -r file; do
  node --check "$file"
done < <(find scripts tests -type f \( -name '*.js' -o -name '*.mjs' \) | sort)

echo "Syntax checks passed."

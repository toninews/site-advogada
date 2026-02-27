#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"
mkdir -p artigos
export PROJECT_ROOT

# Load local env vars for static generation when available.
if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

HOME_HEAD_TEMPLATE="$(cat templates/home-head.template.html)"
HOME_HEAD_TEMPLATE="${HOME_HEAD_TEMPLATE//'{{SITE_RUNTIME}}'/'static'}"
HOME_HEAD_TEMPLATE="${HOME_HEAD_TEMPLATE//'{{CANONICAL_URL}}'/'https://site-advogada-eosin.vercel.app/'}"
HOME_HEAD_TEMPLATE="${HOME_HEAD_TEMPLATE//'{{OG_IMAGE_URL}}'/'https://site-advogada-eosin.vercel.app/images/optimized/partners-1200.webp'}"

printf '%s\n' "$HOME_HEAD_TEMPLATE" > index.html

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

node ./scripts/generate-static-articles.mjs

echo "index.html atualizado com sucesso."

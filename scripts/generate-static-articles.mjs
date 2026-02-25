import fs from "node:fs/promises";
import path from "node:path";

const apiBase = process.env.ARTICLES_API_BASE || "https://blog-back-n6z4.onrender.com";
const siteBase = (process.env.SITE_BASE_URL || "https://site-advogada-eosin.vercel.app").replace(/\/+$/, "");
const uploadsBase = `${apiBase}/uploads`;
const projectRoot = process.env.PROJECT_ROOT || process.cwd();
const articlesDir = path.join(projectRoot, "artigos");
const timeoutMs = Math.max(8000, Number(process.env.ARTICLES_FETCH_TIMEOUT || 35) * 1000);
const maxAttempts = Math.max(1, Number(process.env.ARTICLES_FETCH_RETRIES || 3));

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "artigo";
}

function resolveMediaUrl(value = "") {
  const raw = String(value).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/uploads/")) return `${apiBase}${raw}`;
  if (raw.startsWith("uploads/")) return `${apiBase}/${raw}`;
  return `${uploadsBase}/${encodeURIComponent(raw)}`;
}

function excerpt(content = "", max = 160) {
  const plain = String(content).replace(/\s+/g, " ").trim();
  if (!plain) return "Artigo jurídico da Maria Silva Advocacia.";
  return plain.length <= max ? plain : `${plain.slice(0, max).trimEnd()}...`;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function readTime(content = "") {
  const words = String(content).trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min de leitura`;
}

function renderContentHtml(content = "") {
  const trimmed = String(content).trim();
  if (!trimmed) return "<p>Sem conteúdo disponível.</p>";
  const parts = trimmed.split(/\n\s*\n/);
  const html = parts
    .map((part) => esc(part.trim()).replaceAll("\n", "<br>"))
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");
  return html || "<p>Sem conteúdo disponível.</p>";
}

async function fetchJsonWithRetry(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "site-advogada-static-build/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  throw lastError || new Error("Unknown fetch error");
}

async function main() {
  await fs.rm(articlesDir, { recursive: true, force: true });
  await fs.mkdir(articlesDir, { recursive: true });

  let payload;
  try {
    payload = await fetchJsonWithRetry(`${apiBase}/articles?status=published&limit=200`);
  } catch {
    console.error(`Erro: não foi possível consultar a API de artigos após ${maxAttempts} tentativas.`);
    process.exit(1);
  }

  const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  if (!items.length) {
    console.error("Aviso: API respondeu, mas sem artigos publicados. Pasta /artigos gerada vazia.");
    return;
  }

  const usedSlugs = new Set();
  let written = 0;

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const id = String(item._id || "").trim();
    const title = String(item.title || "Artigo").trim();
    const content = String(item.content || "");
    const slugRaw = String(item.slug || "").trim();
    let slug = slugify(slugRaw || (id ? `id-${id}` : title));
    const baseSlug = slug;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
    usedSlugs.add(slug);

    const seo = item.seo && typeof item.seo === "object" ? item.seo : {};
    const metaTitle = String(seo.metaTitle || "").trim() || title;
    const metaDescription = String(seo.metaDescription || "").trim() || excerpt(content);
    const canonical = String(seo.canonicalUrl || "").trim() || `${siteBase}/artigos/${encodeURIComponent(slug)}/`;
    const coverUrl = resolveMediaUrl(item.coverImage || "");
    const ogImage = resolveMediaUrl(seo.ogImage || "") || coverUrl;
    const published = formatDate(item.publishedAt || item.createdAt || item.updatedAt);
    const views = Number(item.views ?? item.viewCount ?? 0) || 0;
    const likes = Number(item.likes ?? item.likesCount ?? 0) || 0;

    const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(`${metaTitle} | Maria Silva Advocacia`)}</title>
    <meta name="description" content="${esc(metaDescription)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(metaTitle)}" />
    <meta property="og:description" content="${esc(metaDescription)}" />
    <meta property="og:url" content="${esc(canonical)}" />${ogImage ? `
    <meta property="og:image" content="${esc(ogImage)}" />` : ""}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../css/flexboxgrid.css" />
    <link rel="stylesheet" href="../../css/main.css?v=20260223a" />
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
        <a class="article-back-link" href="../../#articles">&larr; Voltar para os artigos</a>
      </div>
      <article class="article-detail">
        ${coverUrl ? `<img class="article-detail-cover" alt="${esc(title)}" src="${esc(coverUrl)}" />` : ""}
        <div class="article-detail-body">
          <h1 id="article-title" class="article-detail-title">${esc(title)}</h1>
          <div class="article-detail-meta">
            <span>${published ? `Publicado em ${esc(published)}` : ""}</span>
            <span>${esc(readTime(content))}</span>
            <span>${esc(String(views))} visualizações</span>
            <span>${esc(String(likes))} curtidas</span>
          </div>
          <div class="article-detail-content">${renderContentHtml(content)}</div>
        </div>
      </article>
    </main>
  </body>
</html>`;

    const targetDir = path.join(articlesDir, slug);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, "index.html"), html, "utf8");
    written += 1;
  }

  console.log(`Artigos estáticos gerados: ${written}`);
}

main().catch((error) => {
  console.error("Erro inesperado ao gerar artigos estáticos:", error?.message || error);
  process.exit(1);
});


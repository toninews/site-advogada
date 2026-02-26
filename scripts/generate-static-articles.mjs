import fs from "node:fs/promises";
import path from "node:path";

const apiBase = process.env.ARTICLES_API_BASE || "https://blog-back-n6z4.onrender.com";
const siteBase = (process.env.SITE_BASE_URL || "https://site-advogada-eosin.vercel.app").replace(/\/+$/, "");
const uploadsBase = `${apiBase}/uploads`;
const projectRoot = process.env.PROJECT_ROOT || process.cwd();
const articlesDir = path.join(projectRoot, "artigos");
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const microsoftClientId = process.env.MICROSOFT_CLIENT_ID || "";
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

function buildCardSummary(item) {
  if (!item || typeof item !== "object") return null;
  const content = String(item.content || "");
  const plain = content.replace(/\s+/g, " ").trim();
  const wordCount = plain ? plain.split(" ").filter(Boolean).length : 0;
  const excerptText = plain.length > 280 ? `${plain.slice(0, 280).trimEnd()}...` : plain;
  return {
    _id: item._id || "",
    slug: item.slug || "",
    title: item.title || "Artigo",
    excerpt: excerptText,
    wordCount,
    coverImage: item.coverImage || "",
    publishedAt: item.publishedAt || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    views: item.views ?? item.viewCount ?? item.viewsCount ?? 0,
    viewCount: item.viewCount ?? item.views ?? item.viewsCount ?? 0,
    viewsCount: item.viewsCount ?? item.views ?? item.viewCount ?? 0,
    likes: item.likes ?? item.likesCount ?? 0,
    likesCount: item.likesCount ?? item.likes ?? 0,
    comments: item.comments ?? item.commentsCount ?? item.commentCount ?? 0,
    commentsCount: item.commentsCount ?? item.comments ?? item.commentCount ?? 0,
    commentCount: item.commentCount ?? item.comments ?? item.commentsCount ?? 0,
  };
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
    await fs.writeFile(path.join(articlesDir, "index.json"), "[]\n", "utf8");
    console.error("Aviso: API respondeu, mas sem artigos publicados. Pasta /artigos gerada vazia.");
    return;
  }

  const cardsPayload = items
    .map((item) => buildCardSummary(item))
    .filter(Boolean);
  await fs.writeFile(
    path.join(articlesDir, "index.json"),
    `${JSON.stringify(cardsPayload)}\n`,
    "utf8",
  );

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
    const comments = Number(item.comments ?? item.commentsCount ?? item.commentCount ?? 0) || 0;

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
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script
      src="https://alcdn.msauth.net/browser/2.35.0/js/msal-browser.min.js"
      defer
      onerror="(function(){var s=document.createElement('script');s.src='https://alcdn.msftauth.net/browser/2.35.0/js/msal-browser.min.js';s.defer=true;document.head.appendChild(s);}())"
    ></script>
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
      .article-comments { margin-top: 1rem; background: #fff; border: 1px solid rgba(182, 135, 34, 0.35); border-radius: 14px; padding: 1rem 1rem 1.15rem; }
      .article-comments h2 { margin: 0 0 0.65rem; color: #223830; font-size: 1.25rem; }
      .article-comments-note { margin: 0 0 0.9rem; color: #4a4a4a; font-size: 0.92rem; }
      .comments-auth-box { margin: 0 0 0.9rem; padding: 0.7rem 0.75rem; border: 1px solid #dedede; border-radius: 10px; background: #fcfcfc; }
      .comments-auth-status { margin: 0 0 0.5rem; color: #4a4a4a; font-size: 0.9rem; }
      .comments-auth-label { margin: 0 0 0.38rem; color: #4a4a4a; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
      .comments-auth-actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
      .comments-auth-providers { display: inline-flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
      .comments-google-btn {
        min-height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
      .comments-provider-btn {
        width: 40px;
        height: 40px;
        min-height: 40px;
        border-radius: 999px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #d0d0d0;
        background: #fff;
        box-shadow: none;
        color: inherit;
        transition: background-color 0.2s ease, border-color 0.2s ease;
      }
      .comments-provider-btn:hover,
      .comments-provider-btn:focus-visible,
      .comments-provider-btn:active {
        background: #f5f5f5;
        border-color: #bdbdbd;
        box-shadow: none;
        color: inherit;
        transform: none;
      }
      .comments-provider-btn svg { width: 16px; height: 16px; }
      .comments-provider-btn--ms svg { width: 13px; height: 13px; }
      .comments-provider-btn--ms {
        width: 34px;
        height: 34px;
        min-height: 34px;
      }
      .comments-auth-providers > * { vertical-align: middle; }
      .comments-provider-btn--ms svg rect { fill: #f25022; }
      .comments-provider-btn--ms svg rect.ms-green { fill: #7fba00; }
      .comments-provider-btn--ms svg rect.ms-blue { fill: #00a4ef; }
      .comments-provider-btn--ms svg rect.ms-yellow { fill: #ffb900; }
      .comments-logout-btn { display: none; }
      .comments-logout-btn.is-visible { display: inline-flex; }
      .comments-form textarea { width: 100%; min-height: 96px; border: 1px solid #cfcfcf; border-radius: 10px; padding: 0.7rem; font-family: "Roboto", sans-serif; resize: vertical; }
      .comments-form-actions { margin-top: 0.55rem; display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
      .comments-feedback { margin: 0.4rem 0 0; color: #223830; font-size: 0.9rem; }
      .comments-list { margin-top: 1rem; display: grid; gap: 0.75rem; }
      .comment-item { border: 1px solid #e2e2e2; border-radius: 10px; padding: 0.75rem 0.8rem; }
      .comment-meta { margin: 0 0 0.35rem; color: #5a5a5a; font-size: 0.84rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
      .comment-content { margin: 0; color: #2e2e2e; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
      .comment-actions { margin-top: 0.55rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
      .comment-action-btn { border: 1px solid #c7c7c7; background: #fff; color: #223830; border-radius: 999px; padding: 0.23rem 0.65rem; font-size: 0.8rem; cursor: pointer; }
      .comments-pagination { margin-top: 0.9rem; display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
      .comments-page-info { color: #4e4e4e; font-size: 0.86rem; }
      .comments-empty { color: #5a5a5a; margin: 0.2rem 0 0; }
      .comments-modal[hidden] { display: none; }
      .comments-modal {
        position: fixed;
        inset: 0;
        z-index: 1200;
        display: grid;
        place-items: center;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.45);
      }
      .comments-modal-card {
        width: min(92vw, 420px);
        background: #fff;
        border: 1px solid rgba(182, 135, 34, 0.4);
        border-radius: 14px;
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.25);
        padding: 1rem;
      }
      .comments-modal-title { margin: 0 0 0.35rem; color: #223830; font-size: 1.06rem; }
      .comments-modal-text { margin: 0; color: #4a4a4a; line-height: 1.5; }
      .comments-modal-actions { margin-top: 0.9rem; display: flex; justify-content: flex-end; gap: 0.55rem; }
      .comments-modal-danger {
        border-color: #b03a2e;
        color: #fff;
        background: #b03a2e;
      }
      .comments-modal-danger:hover,
      .comments-modal-danger:focus-visible,
      .comments-modal-danger:active {
        border-color: #922b21;
        background: #922b21;
        color: #fff;
      }
    </style>
  </head>
  <body>
    <header class="container-fluid header-bg">
      <div class="row middle-xs between-xs header-row">
        <div class="col-xs-12 col-sm-3 start-xs brand-identity">
          <a href="../../" class="logo" aria-label="Voltar para o início">
            <img
              src="../../images/optimized/logo-horizontal-220.webp"
              srcset="../../images/optimized/logo-horizontal-220.webp 220w, ../../images/optimized/logo-horizontal-320.webp 320w"
              sizes="(min-width: 48em) 280px, 200px"
              width="220"
              height="233"
              decoding="async"
              alt="Advogada Maria Silva - Direito Civil e Trabalhista"
            />
          </a>
          <p class="brand-name-header">Maria Silva Advocacia</p>
        </div>
        <div class="col-xs-12 col-sm-9 end-xs header-nav-wrap">
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-menu" aria-label="Abrir menu">
            <span class="menu-toggle-bar"></span>
            <span class="menu-toggle-bar"></span>
            <span class="menu-toggle-bar"></span>
          </button>
          <nav class="site-nav" aria-label="Menu principal">
            <ul id="primary-menu" class="site-menu">
              <li><a href="../../#about"><span>&#9670;</span> Sobre</a></li>
              <li><a href="../../#history"><span>&#9670;</span> História</a></li>
              <li><a href="../../#areas"><span>&#9670;</span> Áreas de Atuação</a></li>
              <li><a href="../../#services"><span>&#9670;</span> Serviços</a></li>
              <li><a href="../../#articles"><span>&#9670;</span> Artigos</a></li>
              <li><a href="../../#contato"><span>&#9670;</span> Contato</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
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
            <span id="article-views-count">${esc(String(views))} visualizações</span>
            <span id="article-likes-count">${esc(String(likes))} curtidas</span>
            <span id="article-comments-count">${esc(String(comments))} comentários</span>
          </div>
          <div class="article-detail-content">${renderContentHtml(content)}</div>
        </div>
      </article>
      <section class="article-comments" id="article-comments" data-article-slug="${esc(slug)}" data-article-id="${esc(id)}" aria-labelledby="comments-title">
        <h2 id="comments-title">Comentários</h2>
        <p class="article-comments-note">Entre com sua conta para comentar. Os comentários passam por regras anti-spam e moderação.</p>
        <div class="comments-auth-box">
          <p id="comments-auth-status" class="comments-auth-status">Entre com sua conta para comentar.</p>
          <p class="comments-auth-label">Fazer login com</p>
          <div class="comments-auth-actions">
            <div class="comments-auth-providers" aria-label="Provedores de login">
              <div id="comments-google-btn" class="comments-google-btn" aria-label="Entrar com Google"></div>
              <button id="comments-microsoft-btn" class="btn comments-provider-btn comments-provider-btn--ms" type="button" aria-label="Entrar com Microsoft" title="Entrar com Microsoft">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="2" y="2" width="9" height="9"></rect>
                  <rect class="ms-green" x="13" y="2" width="9" height="9"></rect>
                  <rect class="ms-blue" x="2" y="13" width="9" height="9"></rect>
                  <rect class="ms-yellow" x="13" y="13" width="9" height="9"></rect>
                </svg>
              </button>
            </div>
            <button id="comments-logout-btn" class="btn comments-logout-btn" type="button">Sair</button>
          </div>
        </div>
        <form id="comments-form" class="comments-form">
          <textarea id="comment-content" name="content" maxlength="2000" placeholder="Escreva seu comentário..." required></textarea>
          <div class="comments-form-actions">
            <button class="btn" type="submit">Publicar comentário</button>
            <span id="comments-feedback" class="comments-feedback" aria-live="polite"></span>
          </div>
        </form>
        <div id="comments-list" class="comments-list" role="list"></div>
        <p id="comments-empty" class="comments-empty" hidden>Nenhum comentário ainda. Seja o primeiro a comentar.</p>
        <div class="comments-pagination">
          <button id="comments-prev" class="btn" type="button">Anterior</button>
          <button id="comments-next" class="btn" type="button">Próxima</button>
          <span id="comments-page-info" class="comments-page-info"></span>
        </div>
      </section>
      <div id="comments-delete-modal" class="comments-modal" hidden>
        <div class="comments-modal-card" role="dialog" aria-modal="true" aria-labelledby="comments-delete-title">
          <h3 id="comments-delete-title" class="comments-modal-title">Excluir comentário</h3>
          <p class="comments-modal-text">Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.</p>
          <div class="comments-modal-actions">
            <button id="comments-delete-cancel" class="btn" type="button">Cancelar</button>
            <button id="comments-delete-confirm" class="btn comments-modal-danger" type="button">Excluir</button>
          </div>
        </div>
      </div>
    </main>
    <footer class="container-fluid site-footer" aria-labelledby="footer-title">
      <div class="row start-xs site-footer-row">
        <div class="col-xs-12 col-md-3 footer-col footer-col-start">
          <div class="footer-brand-block">
            <a href="../../" class="footer-logo" aria-label="Voltar para o início">
              <img
                src="../../images/optimized/logo-horizontal-220.webp"
                srcset="../../images/optimized/logo-horizontal-220.webp 220w, ../../images/optimized/logo-horizontal-320.webp 320w"
                sizes="(min-width: 48em) 220px, 180px"
                width="220"
                height="233"
                decoding="async"
                alt="Maria Silva Advocacia"
              />
            </a>
            <p id="footer-title" class="footer-brand-name">Maria Silva Advocacia</p>
          </div>
        </div>
        <div class="col-xs-12 col-md-3 footer-col footer-col-center">
          <div class="footer-info-block">
            <h3 class="footer-title">Endereço</h3>
            <p>Rua das Acácias, 245</p>
            <p>Centro, Cidade Exemplo - UF</p>
            <p>CEP 00000-000</p>
          </div>
        </div>
        <div class="col-xs-12 col-md-3 footer-col footer-col-end">
          <div class="footer-info-block">
            <h3 class="footer-title">Contato</h3>
            <p><a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer">(00) 00000-0000</a></p>
            <p><a href="mailto:contato@exemplo.test">contato@exemplo.test</a></p>
            <p>Segunda a Sexta: 09h às 18h</p>
          </div>
        </div>
        <div class="col-xs-12 col-sm-3 footer-col footer-col-end">
          <div class="footer-info-block">
            <h3 class="footer-title">Redes Sociais</h3>
            <div class="footer-social" aria-label="Redes sociais">
              <a href="#" class="footer-social-link" aria-label="Facebook" title="Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.5 8.5h2V6h-2.3c-2.2 0-3.7 1.4-3.7 3.8V12H7v2.5h2.5V21h2.8v-6.5h2.7L15.5 12h-3.2V9.9c0-.9.3-1.4 1.2-1.4z"/></svg>
              </a>
              <a href="#" class="footer-social-link" aria-label="Instagram" title="Instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16.5 3h-9A4.5 4.5 0 0 0 3 7.5v9A4.5 4.5 0 0 0 7.5 21h9a4.5 4.5 0 0 0 4.5-4.5v-9A4.5 4.5 0 0 0 16.5 3zm2 13.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9zm-6.5-8A4 4 0 1 0 16 12a4 4 0 0 0-4-3.5zm0 5.5A1.5 1.5 0 1 1 13.5 12 1.5 1.5 0 0 1 12 14zm4.4-6.1a.95.95 0 1 0 .95.95.95.95 0 0 0-.95-.95z"/></svg>
              </a>
              <a href="#" class="footer-social-link" aria-label="LinkedIn" title="LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.7 8.6a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM5.3 10h2.8v8.7H5.3V10zm4.7 0h2.7v1.2h.1c.4-.7 1.4-1.5 2.9-1.5 3.1 0 3.7 2 3.7 4.7v4.3h-2.8v-3.8c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2v3.9H10V10z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="row center-xs">
        <div class="col-xs-12">
          <p class="footer-disclaimer">Aviso de transparência: parte das imagens deste site foi gerada com auxílio de IA e ajustada para fins ilustrativos.</p>
          <p class="footer-credit">
            <span>Maria Silva Advocacia • Desenvolvido por toninews</span>
            <img src="../../images/optimized/cim.webp" alt="CIM" loading="lazy" decoding="async" class="footer-credit-badge" />
          </p>
        </div>
      </div>
    </footer>
    <script>
      (() => {
        const menuToggle = document.querySelector(".menu-toggle");
        const siteMenu = document.querySelector(".site-menu");
        if (!menuToggle || !siteMenu) return;
        const closeMenu = () => {
          menuToggle.setAttribute("aria-expanded", "false");
          menuToggle.setAttribute("aria-label", "Abrir menu");
          siteMenu.classList.remove("is-open");
        };
        menuToggle.addEventListener("click", () => {
          const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
          menuToggle.setAttribute("aria-expanded", String(!isOpen));
          menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
          siteMenu.classList.toggle("is-open");
        });
        document.addEventListener("click", (event) => {
          const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
          if (!isOpen) return;
          if (menuToggle.contains(event.target) || siteMenu.contains(event.target)) return;
          closeMenu();
        });
      })();
    </script>
    <script>
      (() => {
        const root = document.getElementById("article-comments");
        if (!root) return;

        const articleSlug = root.getAttribute("data-article-slug") || "";
        const articleId = root.getAttribute("data-article-id") || "";
        if (!articleSlug) return;

        const API_BASE = ["localhost", "127.0.0.1"].includes(window.location.hostname)
          ? "http://localhost:4010"
          : "https://blog-back-n6z4.onrender.com";
        const GOOGLE_CLIENT_ID = "${esc(googleClientId)}";
        const MICROSOFT_CLIENT_ID = "${esc(microsoftClientId)}";

        const form = document.getElementById("comments-form");
        const input = document.getElementById("comment-content");
        const feedback = document.getElementById("comments-feedback");
        const authStatus = document.getElementById("comments-auth-status");
        const googleBtn = document.getElementById("comments-google-btn");
        const microsoftBtn = document.getElementById("comments-microsoft-btn");
        const logoutBtn = document.getElementById("comments-logout-btn");
        const list = document.getElementById("comments-list");
        const empty = document.getElementById("comments-empty");
        const prevBtn = document.getElementById("comments-prev");
        const nextBtn = document.getElementById("comments-next");
        const pageInfo = document.getElementById("comments-page-info");
        const commentsCountMeta = document.getElementById("article-comments-count");
        const viewsCountMeta = document.getElementById("article-views-count");
        const likesCountMeta = document.getElementById("article-likes-count");
        const deleteModal = document.getElementById("comments-delete-modal");
        const deleteCancelBtn = document.getElementById("comments-delete-cancel");
        const deleteConfirmBtn = document.getElementById("comments-delete-confirm");

        let page = 1;
        const pageSize = 10;
        let total = 0;
        let isLoggedIn = false;
        let msalInstance = null;

        function toInt(value, fallback = 0) {
          const parsed = Number.parseInt(value, 10);
          return Number.isFinite(parsed) ? parsed : fallback;
        }

        function getCookie(name) {
          const row = document.cookie
            .split("; ")
            .find((item) => item.startsWith(name + "="));
          return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : "";
        }

        function escHtml(value) {
          return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
        }

        function setFeedback(message, isError) {
          feedback.textContent = message || "";
          feedback.style.color = isError ? "#b03a2e" : "#223830";
        }

        function setAuthStatus(message) {
          if (!authStatus) return;
          authStatus.textContent = message || "";
        }

        function setLoggedInUI(loggedIn) {
          isLoggedIn = Boolean(loggedIn);
          if (logoutBtn) {
            logoutBtn.classList.toggle("is-visible", isLoggedIn);
          }
        }

        async function requestJson(url, options) {
          const response = await fetch(url, {
            credentials: "include",
            ...options,
          });
          const isJson = (response.headers.get("content-type") || "").includes("application/json");
          const body = isJson ? await response.json() : null;
          return { response, body };
        }

        function confirmDeleteComment() {
          if (!deleteModal || !deleteCancelBtn || !deleteConfirmBtn) {
            return Promise.resolve(window.confirm("Deseja excluir este comentário?"));
          }
          return new Promise((resolve) => {
            const close = (result) => {
              deleteModal.hidden = true;
              deleteCancelBtn.removeEventListener("click", onCancel);
              deleteConfirmBtn.removeEventListener("click", onConfirm);
              deleteModal.removeEventListener("click", onBackdrop);
              document.removeEventListener("keydown", onKeyDown);
              resolve(result);
            };
            const onCancel = () => close(false);
            const onConfirm = () => close(true);
            const onBackdrop = (event) => {
              if (event.target === deleteModal) close(false);
            };
            const onKeyDown = (event) => {
              if (event.key === "Escape") close(false);
            };

            deleteModal.hidden = false;
            deleteCancelBtn.addEventListener("click", onCancel);
            deleteConfirmBtn.addEventListener("click", onConfirm);
            deleteModal.addEventListener("click", onBackdrop);
            document.addEventListener("keydown", onKeyDown);
            deleteConfirmBtn.focus();
          });
        }

        function getFingerprint() {
          const storageKey = "site-advogada-fingerprint-v1";
          try {
            const existing = localStorage.getItem(storageKey);
            if (existing) return existing;
            const generated = (window.crypto && window.crypto.randomUUID)
              ? window.crypto.randomUUID()
              : String(Date.now()) + "-" + Math.random().toString(36).slice(2, 12);
            localStorage.setItem(storageKey, generated);
            return generated;
          } catch (_) {
            return "anon-" + Date.now() + "-" + Math.random().toString(36).slice(2, 12);
          }
        }

        function pickCount(payload, key) {
          if (!payload || typeof payload !== "object") return null;
          const candidates = [
            payload[key],
            payload?.data?.[key],
            payload?.article?.[key],
            payload?.result?.[key],
          ];
          for (const value of candidates) {
            const parsed = toInt(value, NaN);
            if (Number.isFinite(parsed)) return parsed;
          }
          return null;
        }

        async function registerView() {
          if (!articleId || !viewsCountMeta) return;
          try {
            const response = await fetch(API_BASE + "/articles/" + encodeURIComponent(articleId) + "/view", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ fingerprint: getFingerprint() }),
            });
            if (!response.ok) return;
            const payload = await response.json();
            const nextViews = pickCount(payload, "views");
            if (Number.isFinite(nextViews)) {
              viewsCountMeta.textContent = nextViews + " visualizações";
            }
          } catch (_) {}
        }

        async function syncArticleStats() {
          if (!articleId) return;
          try {
            const { response, body } = await requestJson(API_BASE + "/articles/" + encodeURIComponent(articleId), {
              method: "GET",
              headers: { Accept: "application/json" },
            });
            if (!response.ok || !body) return;

            const latestViews = pickCount(body, "views");
            if (Number.isFinite(latestViews) && viewsCountMeta) {
              viewsCountMeta.textContent = latestViews + " visualizações";
            }

            const latestLikes = pickCount(body, "likes");
            if (Number.isFinite(latestLikes) && likesCountMeta) {
              likesCountMeta.textContent = latestLikes + " curtidas";
            }
          } catch (_) {}
        }

        function buildWriteHeaders() {
          const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
          };
          const csrf = getCookie("csrf_token");
          if (csrf) headers["x-csrf-token"] = csrf;
          return headers;
        }

        function formatDate(value) {
          if (!value) return "";
          const d = new Date(value);
          if (Number.isNaN(d.getTime())) return "";
          return d.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        function renderList(items) {
          if (!Array.isArray(items) || !items.length) {
            list.innerHTML = "";
            empty.hidden = false;
            return;
          }
          empty.hidden = true;
          list.innerHTML = items.map((item) => {
            const id = escHtml(item.id || "");
            const author = escHtml(item?.author?.name || "Usuário");
            const content = escHtml(item.content || "");
            const date = escHtml(formatDate(item.editedAt || item.createdAt));
            const canEdit = Boolean(item.canEdit);
            const canDelete = Boolean(item.canDelete);
            return '<article class="comment-item" role="listitem">' +
              '<p class="comment-meta"><strong>' + author + "</strong><span>" + date + "</span></p>" +
              '<p class="comment-content">' + content + "</p>" +
              '<div class="comment-actions">' +
              (canEdit ? '<button class="comment-action-btn" type="button" data-action="edit" data-id="' + id + '" data-content="' + content + '">Editar</button>' : "") +
              (canDelete ? '<button class="comment-action-btn" type="button" data-action="delete" data-id="' + id + '">Excluir</button>' : "") +
              '<button class="comment-action-btn" type="button" data-action="report" data-id="' + id + '">Denunciar</button>' +
              "</div></article>";
          }).join("");
        }

        function updatePagination() {
          const totalPages = Math.max(1, Math.ceil(total / pageSize));
          pageInfo.textContent = "Página " + page + " de " + totalPages + " • " + total + " comentários";
          if (commentsCountMeta) {
            commentsCountMeta.textContent = total + " comentários";
          }
          prevBtn.disabled = page <= 1;
          nextBtn.disabled = page >= totalPages;
        }

        async function loadComments() {
          setFeedback("", false);
          try {
            const query = new URLSearchParams({
              slug: articleSlug,
              page: String(page),
              pageSize: String(pageSize),
            });
            const { response, body } = await requestJson(API_BASE + "/comments?" + query.toString(), {
              method: "GET",
              headers: { Accept: "application/json" },
            });
            if (!response.ok) throw new Error("Falha ao carregar comentários.");
            total = Number(body?.total || 0);
            renderList(body?.items || []);
            updatePagination();
          } catch (error) {
            setFeedback("Não foi possível carregar os comentários agora.", true);
          }
        }

        async function submitComment(event) {
          event.preventDefault();
          const content = String(input.value || "").trim();
          if (!content) {
            setFeedback("Digite um comentário antes de publicar.", true);
            return;
          }
          try {
            setFeedback("Enviando comentário...", false);
            const { response } = await requestJson(API_BASE + "/comments", {
              method: "POST",
              headers: buildWriteHeaders(),
              body: JSON.stringify({ articleSlug, content }),
            });
            if (response.status === 401) {
              setFeedback("Faça login para comentar.", true);
              setAuthStatus("Sessão não encontrada. Faça login com Google ou Microsoft para comentar.");
              setLoggedInUI(false);
              return;
            }
            if (!response.ok) {
              setFeedback("Não foi possível publicar agora.", true);
              return;
            }
            input.value = "";
            setFeedback("Comentário enviado com sucesso.", false);
            page = 1;
            await loadComments();
          } catch (_) {
            setFeedback("Erro ao enviar comentário.", true);
          }
        }

        async function handleAction(event) {
          const button = event.target.closest("button[data-action]");
          if (!button) return;
          const id = button.getAttribute("data-id");
          const action = button.getAttribute("data-action");
          if (!id || !action) return;

          try {
            if (action === "edit") {
              const next = window.prompt("Editar comentário:", button.getAttribute("data-content") || "");
              if (next === null) return;
              const content = String(next).trim();
              if (!content) return;
              const { response } = await requestJson(API_BASE + "/comments/" + encodeURIComponent(id), {
                method: "PATCH",
                headers: buildWriteHeaders(),
                body: JSON.stringify({ content }),
              });
              if (response.status === 401) setFeedback("Faça login para editar.", true);
              else if (!response.ok) setFeedback("Não foi possível editar.", true);
              else setFeedback("Comentário atualizado.", false);
            } else if (action === "delete") {
              if (!(await confirmDeleteComment())) return;
              const { response } = await requestJson(API_BASE + "/comments/" + encodeURIComponent(id), {
                method: "DELETE",
                headers: buildWriteHeaders(),
              });
              if (response.status === 401) setFeedback("Faça login para excluir.", true);
              else if (!response.ok) setFeedback("Não foi possível excluir.", true);
              else setFeedback("Comentário removido.", false);
            } else if (action === "report") {
              const reason = window.prompt("Motivo da denúncia (opcional):", "") || "";
              const { response } = await requestJson(API_BASE + "/comments/" + encodeURIComponent(id) + "/report", {
                method: "POST",
                headers: buildWriteHeaders(),
                body: JSON.stringify({ reason }),
              });
              if (response.status === 401) setFeedback("Faça login para denunciar.", true);
              else if (!response.ok) setFeedback("Não foi possível enviar denúncia.", true);
              else setFeedback("Denúncia enviada.", false);
            }
            await loadComments();
          } catch (_) {
            setFeedback("Ação não concluída no momento.", true);
          }
        }

        async function completeSocialLogin(providerLabel, endpoint, idToken) {
          if (!idToken) return;
          try {
            setAuthStatus("Validando login " + providerLabel + "...");
            const { response: r, body } = await requestJson(API_BASE + endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ idToken }),
            });
            if (!r.ok) {
              setAuthStatus((body && body.message) ? body.message : "Falha no login social.");
              setLoggedInUI(false);
              return;
            }
            setLoggedInUI(true);
            setAuthStatus("Login realizado. Você já pode comentar.");
            setFeedback("Sessão iniciada com sucesso.", false);
            await loadComments();
          } catch (_) {
            setAuthStatus("Erro de rede ao fazer login " + providerLabel + ".");
          }
        }

        async function onGoogleCredentialResponse(response) {
          const idToken = String(response?.credential || "").trim();
          await completeSocialLogin("Google", "/login/authGoogle", idToken);
        }

        function initGoogleLogin() {
          if (!GOOGLE_CLIENT_ID) {
            if (googleBtn) googleBtn.style.display = "none";
            return;
          }
          if (!window.google || !window.google.accounts || !window.google.accounts.id || !googleBtn) {
            setAuthStatus("Carregando login Google...");
            return;
          }
          window.onGoogleCredentialResponse = onGoogleCredentialResponse;
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: onGoogleCredentialResponse,
            auto_select: false,
          });
          window.google.accounts.id.renderButton(googleBtn, {
            type: "icon",
            size: "medium",
            theme: "outline",
            shape: "circle",
          });
          if (!MICROSOFT_CLIENT_ID) {
            setAuthStatus("Faça login com Google para comentar.");
          }
        }

        async function loginWithMicrosoft() {
          if (!MICROSOFT_CLIENT_ID) {
            setFeedback("Login Microsoft indisponível: MICROSOFT_CLIENT_ID não configurado.", true);
            return;
          }
          const waitForMsal = async (timeoutMs) => {
            const startedAt = Date.now();
            while (Date.now() - startedAt < timeoutMs) {
              if (window.msal && window.msal.PublicClientApplication) return true;
              await new Promise((resolve) => setTimeout(resolve, 120));
            }
            return false;
          };

          const msalReady = await waitForMsal(8000);
          if (!msalReady) {
            setFeedback("Não foi possível carregar o login Microsoft agora. Tente novamente em alguns segundos.", true);
            return;
          }

          try {
            if (!msalInstance) {
              msalInstance = new window.msal.PublicClientApplication({
                auth: {
                  clientId: MICROSOFT_CLIENT_ID,
                  authority: "https://login.microsoftonline.com/common",
                  redirectUri: window.location.origin,
                },
                cache: { cacheLocation: "sessionStorage" },
              });
              if (typeof msalInstance.initialize === "function") {
                await msalInstance.initialize();
              }
            }

            const loginRes = await msalInstance.loginPopup({
              scopes: ["openid", "profile", "email"],
              prompt: "select_account",
            });

            let idToken = String(loginRes?.idToken || "").trim();
            if (!idToken && loginRes?.account && typeof msalInstance.acquireTokenSilent === "function") {
              const silentRes = await msalInstance.acquireTokenSilent({
                account: loginRes.account,
                scopes: ["openid", "profile", "email"],
              });
              idToken = String(silentRes?.idToken || "").trim();
            }

            if (!idToken) {
              setFeedback("Microsoft não retornou idToken. Verifique App Registration (SPA + Redirect URI + ID tokens).", true);
              return;
            }

            await completeSocialLogin("Microsoft", "/login/authMicrosoft", idToken);
          } catch (error) {
            const message = String(error?.message || error?.errorMessage || "").trim();
            setFeedback(message ? ("Falha no login Microsoft: " + message) : "Falha no login Microsoft.", true);
          }
        }

        async function logout() {
          try {
            const logoutEndpoints = ["/login/logout", "/login/authLogout"];
            let ok = false;
            let unauthorized = false;

            for (const endpoint of logoutEndpoints) {
              const { response } = await requestJson(API_BASE + endpoint, {
                method: "POST",
                headers: buildWriteHeaders(),
              });
              if (response.status === 401) {
                unauthorized = true;
                break;
              }
              if (response.ok) {
                ok = true;
                break;
              }
            }

            if (!ok && !unauthorized) {
              setFeedback("Não foi possível encerrar a sessão agora.", true);
              return;
            }

            if (window.google && window.google.accounts && window.google.accounts.id) {
              window.google.accounts.id.disableAutoSelect();
            }
            setLoggedInUI(false);
            setAuthStatus("Sessão encerrada. Faça login com Google ou Microsoft para comentar.");
            setFeedback("Logout realizado.", false);
          } catch (_) {
            setFeedback("Erro ao encerrar sessão.", true);
          }
        }

        form.addEventListener("submit", submitComment);
        list.addEventListener("click", handleAction);
        if (microsoftBtn) microsoftBtn.addEventListener("click", loginWithMicrosoft);
        if (logoutBtn) logoutBtn.addEventListener("click", logout);
        prevBtn.addEventListener("click", () => { if (page > 1) { page -= 1; loadComments(); } });
        nextBtn.addEventListener("click", () => {
          const totalPages = Math.max(1, Math.ceil(total / pageSize));
          if (page < totalPages) { page += 1; loadComments(); }
        });

        loadComments();
        registerView();
        syncArticleStats();
        setLoggedInUI(false);
        if (!MICROSOFT_CLIENT_ID && microsoftBtn) {
          microsoftBtn.style.display = "none";
        }
        if (MICROSOFT_CLIENT_ID && microsoftBtn) {
          microsoftBtn.disabled = true;
          const enableMicrosoftWhenReady = () => {
            if (window.msal && window.msal.PublicClientApplication) {
              microsoftBtn.disabled = false;
              return;
            }
            window.setTimeout(enableMicrosoftWhenReady, 150);
          };
          enableMicrosoftWhenReady();
        }
        if (!GOOGLE_CLIENT_ID && !MICROSOFT_CLIENT_ID) {
          setAuthStatus("Login social indisponível: configure GOOGLE_CLIENT_ID ou MICROSOFT_CLIENT_ID no build.");
        } else if (GOOGLE_CLIENT_ID && MICROSOFT_CLIENT_ID) {
          setAuthStatus("Faça login com Google ou Microsoft para comentar.");
        } else if (MICROSOFT_CLIENT_ID) {
          setAuthStatus("Faça login com Microsoft para comentar.");
        }
        setTimeout(initGoogleLogin, 0);
        window.addEventListener("load", initGoogleLogin);
      })();
    </script>
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

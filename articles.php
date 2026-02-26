<section id="articles" class="articles-section container-fluid" aria-labelledby="articles-title">
  <div class="row center-xs">
    <div class="col-xs-12">
      <h2 id="articles-title" class="section-title section-title-green">Artigos</h2>
    </div>
  </div>

  <div class="row center-xs">
    <div class="col-xs-12 col-md-10">
      <p id="articles-status" aria-live="polite">Carregando artigos...</p>
      <div id="articles-list" class="articles-grid" role="list"></div>
    </div>
  </div>
</section>

<script>
(() => {
  const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:4010'
    : 'https://blog-back-n6z4.onrender.com';

  const API_URL = `${API_BASE}/articles?status=published&limit=6`;
  const STATIC_INDEX_URL = 'artigos/index.json';
  const UPLOADS_BASE = `${API_BASE}/uploads`;
  const statusEl = document.getElementById('articles-status');
  const listEl = document.getElementById('articles-list');
  const likesState = new Map();
  const isPhpRuntime = window.__SITE_RUNTIME__ === 'php';

  const LIKED_STORAGE_KEY = 'site-advogada-liked-articles-v1';
  const FINGERPRINT_STORAGE_KEY = 'site-advogada-fingerprint-v1';

  if (!statusEl || !listEl) return;

  const safe = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const toInt = (value, fallback = 0) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  function pickMetric(source, paths) {
    if (!source || typeof source !== 'object') return null;
    for (const path of paths) {
      const parts = String(path).split('.');
      let current = source;
      for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
          current = undefined;
          break;
        }
        current = current[part];
      }
      const parsed = toInt(current, NaN);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  }

  function getFingerprint() {
    try {
      const existing = localStorage.getItem(FINGERPRINT_STORAGE_KEY);
      if (existing) return existing;
      const generated = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(FINGERPRINT_STORAGE_KEY, generated);
      return generated;
    } catch (_) {
      return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    }
  }

  const fingerprint = getFingerprint();

  const likedStorage = (() => {
    try {
      const raw = localStorage.getItem(LIKED_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  })();

  function saveLikedStorage() {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(likedStorage));
    } catch (_) {}
  }

  function getReadTime(content) {
    if (Number.isFinite(Number(content)) && Number(content) > 0) {
      const minutesFromCount = Math.max(1, Math.round(Number(content) / 220));
      return `${minutesFromCount} min de leitura`;
    }
    const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 220));
    return `${minutes} min de leitura`;
  }

  function formatArticleDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function slugifyPath(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    const normalized = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return normalized || 'artigo';
  }

  function resolveCoverUrl(coverImage) {
    if (!coverImage) return '';
    const value = String(coverImage).trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/uploads/')) return `${API_BASE}${value}`;
    if (value.startsWith('uploads/')) return `${API_BASE}/${value}`;
    return `${UPLOADS_BASE}/${encodeURIComponent(value)}`;
  }

  function pickCount(payload, key) {
    if (!payload || typeof payload !== 'object') return null;
    const candidates = [
      payload[key],
      payload?.data?.[key],
      payload?.article?.[key],
      payload?.result?.[key]
    ];
    for (const value of candidates) {
      const parsed = toInt(value, NaN);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  }

  async function sendLikeEvent(articleId, method) {
    const response = await fetch(`${API_BASE}/articles/${encodeURIComponent(articleId)}/like`, {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ fingerprint })
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  function renderArticles(items) {
    if (!Array.isArray(items) || items.length === 0) {
      statusEl.textContent = 'Nenhum artigo encontrado.';
      listEl.innerHTML = '';
      return;
    }

    const pendingCommentTotals = [];
    const pendingViewTotals = [];
    statusEl.textContent = '';
    listEl.innerHTML = items.map((item, index) => {
      const id = safe(item._id || '');
      const title = safe(item.title || 'Sem título');
      const rawContent = String(item.content || item.excerpt || '');
      const excerpt = safe(rawContent.slice(0, 180) + (rawContent.length > 180 ? '...' : ''));
      const cover = resolveCoverUrl(item.coverImage);
      const viewsMetric = pickMetric(item, [
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
        'analytics.views'
      ]);
      const views = viewsMetric ?? 0;
      const commentsMetric = pickMetric(item, ['comments', 'commentsCount', 'commentCount', 'stats.comments', 'metrics.comments', 'counters.comments']);
      const commentsCount = commentsMetric ?? 0;
      const initialLikes = pickMetric(item, ['likes', 'likesCount', 'stats.likes', 'metrics.likes', 'counters.likes']) ?? 0;
      const readTime = getReadTime(item.wordCount || rawContent);
      const publishedDate = formatArticleDate(item.publishedAt || item.createdAt || item.updatedAt);
      const key = id || `local-${index}`;
      const rawId = String(item._id || '').trim();
      const rawSlug = String(item.slug || '').trim();
      const slugParam = rawSlug ? `&slug=${encodeURIComponent(rawSlug)}` : '';
      const staticSlug = slugifyPath(rawSlug || (rawId ? `id-${rawId}` : ''));
      const articleUrl = rawId
        ? (isPhpRuntime
          ? `artigo.php?id=${encodeURIComponent(rawId)}${slugParam}`
          : `artigos/${encodeURIComponent(staticSlug)}/`)
        : '#';

      if (commentsMetric === null && rawSlug) {
        pendingCommentTotals.push({ key, slug: rawSlug });
      }
      if (viewsMetric === null && (rawId || rawSlug)) {
        pendingViewTotals.push({ key, identifier: rawId || rawSlug });
      }

      return `
        <article class="article-card" role="listitem" data-article-key="${safe(key)}" data-article-id="${id}">
          <a class="article-card-media" href="${articleUrl}" aria-label="Abrir artigo ${title}">
            ${cover
              ? `<img class="article-card-image" src="${cover}" alt="${title}" loading="lazy" decoding="async">`
              : '<div class="article-card-placeholder" aria-hidden="true"></div>'}
          </a>
          <div class="article-card-body">
            <div class="article-card-meta">
              <span>${readTime}</span>
              <span class="article-card-date">${publishedDate ? `Publicado em ${publishedDate}` : ''}</span>
            </div>
            <h3 class="article-card-title"><a href="${articleUrl}">${title}</a></h3>
            <p class="article-card-excerpt">${excerpt}</p>
          </div>
          <div class="article-card-footer">
            <div class="article-card-stats">
              <span class="article-stat article-views" aria-label="${views} visualizações">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 5c5.6 0 9.8 4.9 11 6.5.2.3.2.7 0 1C21.8 14 17.6 19 12 19S2.2 14 1 12.5a.8.8 0 0 1 0-1C2.2 9.9 6.4 5 12 5zm0 2C8 7 4.8 10.3 3.1 12 4.8 13.7 8 17 12 17s7.2-3.3 8.9-5C19.2 10.3 16 7 12 7zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z"/>
                </svg>
                <span class="article-views-count" data-views-key="${safe(key)}">${views}</span>
              </span>
              <span class="article-stat article-comments" aria-label="${commentsCount} comentários">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 3v7h14V7H5z"/>
                </svg>
                <span class="article-comments-count" data-comments-key="${safe(key)}">${commentsCount}</span>
              </span>
            </div>
            <button
              class="article-like-btn"
              type="button"
              data-like-btn
              data-article-id="${id}"
              data-like-key="${safe(key)}"
              data-like-initial="${initialLikes}"
              aria-label="Curtir artigo"
            >
              <span class="article-like-count">${initialLikes}</span>
              <span class="article-heart" aria-hidden="true">❤</span>
              <span class="article-sparks" aria-hidden="true">
                <i></i><i></i><i></i><i></i><i></i><i></i>
              </span>
            </button>
          </div>
        </article>
      `;
    }).join('');

    if (pendingCommentTotals.length) {
      Promise.all(pendingCommentTotals.map(async ({ key, slug }) => {
        try {
          const query = new URLSearchParams({
            slug,
            page: '1',
            pageSize: '1'
          });
          const response = await fetch(`${API_BASE}/comments?${query.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) return;
          const payload = await response.json();
          const total = toInt(payload?.total, NaN);
          if (!Number.isFinite(total)) return;
          const el = listEl.querySelector(`[data-comments-key="${CSS.escape(String(key))}"]`);
          if (el) el.textContent = String(total);
        } catch (_) {}
      }));
    }

    if (pendingViewTotals.length) {
      Promise.all(pendingViewTotals.map(async ({ key, identifier }) => {
        try {
          const response = await fetch(`${API_BASE}/articles/${encodeURIComponent(identifier)}`, {
            method: 'GET',
            headers: { Accept: 'application/json' }
          });
          if (!response.ok) return;
          const payload = await response.json();
          const viewsValue = pickMetric(payload, [
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
          if (!Number.isFinite(viewsValue)) return;
          const el = listEl.querySelector(`[data-views-key="${CSS.escape(String(key))}"]`);
          if (el) el.textContent = String(viewsValue);
        } catch (_) {}
      }));
    }
  }

  function initLikeButtons() {
    listEl.querySelectorAll('[data-like-btn]').forEach((btn) => {
      const key = btn.dataset.likeKey;
      const initial = toInt(btn.dataset.likeInitial, 0);
      const articleId = String(btn.dataset.articleId || '').trim();
      const likedFromStorage = Boolean(articleId && likedStorage[articleId]);
      if (!likesState.has(key)) {
        likesState.set(key, { liked: likedFromStorage, count: initial, pending: false });
      }
      btn.classList.toggle('is-liked', likedFromStorage);
    });
  }

  listEl.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-like-btn]');
    if (!button) return;

    const key = button.dataset.likeKey;
    const articleId = String(button.dataset.articleId || '').trim();
    if (!key || !likesState.has(key) || !articleId) return;

    event.preventDefault();
    event.stopPropagation();

    const state = likesState.get(key);
    if (state.pending) return;

    const nextLiked = !state.liked;
    const method = nextLiked ? 'POST' : 'DELETE';
    state.pending = true;
    likesState.set(key, state);
    button.disabled = true;

    try {
      const payload = await sendLikeEvent(articleId, method);
      const serverLikes = pickCount(payload, 'likes');

      state.liked = nextLiked;
      state.count = Number.isFinite(serverLikes)
        ? serverLikes
        : Math.max(0, state.count + (state.liked ? 1 : -1));

      likedStorage[articleId] = state.liked;
      saveLikedStorage();

      const countEl = button.querySelector('.article-like-count');
      if (countEl) countEl.textContent = String(state.count);
      button.classList.toggle('is-liked', state.liked);

      button.classList.remove('is-animating');
      void button.offsetWidth;
      button.classList.add('is-animating');
    } catch (error) {
      console.error('Erro ao enviar like:', error);
    } finally {
      state.pending = false;
      likesState.set(key, state);
      button.disabled = false;
    }
  });

  async function loadArticles() {
    if (!isPhpRuntime) {
      try {
        const staticResponse = await fetch(STATIC_INDEX_URL, {
          method: 'GET',
          headers: { Accept: 'application/json' }
        });
        if (staticResponse.ok) {
          const staticPayload = await staticResponse.json();
          const staticItems = Array.isArray(staticPayload) ? staticPayload.slice(0, 6) : [];
          if (staticItems.length) {
            renderArticles(staticItems);
            initLikeButtons();
            return;
          }
        }
      } catch (_) {}
    }

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.data || []);
      renderArticles(items);
      initLikeButtons();
    } catch (error) {
      statusEl.textContent = 'Não foi possível carregar os artigos agora.';
      listEl.innerHTML = '';
      console.error('Erro ao carregar artigos:', error);
    }
  }

  loadArticles();
})();
</script>

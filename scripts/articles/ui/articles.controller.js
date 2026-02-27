(function registerArticlesController(global) {
  function createArticlesController(deps) {
    const {
      useCase,
      storage,
      domain,
      domainError = {},
      config
    } = deps;
    const isDomainError = domainError.isDomainError || ((error) => Boolean(error && error.name === 'DomainError'));

    const statusEl = document.getElementById('articles-status');
    const listEl = document.getElementById('articles-list');
    const likesState = new Map();
    const fingerprint = storage.getFingerprint();

    if (!statusEl || !listEl) {
      return { start: () => {} };
    }

    function updateViewCount(cardKey, value) {
      const viewEl = listEl.querySelector(`[data-views-key="${CSS.escape(String(cardKey))}"]`);
      if (viewEl) viewEl.textContent = String(value);
    }

    function updateCommentsCount(cardKey, value) {
      const commentsEl = listEl.querySelector(`[data-comments-key="${CSS.escape(String(cardKey))}"]`);
      if (commentsEl) commentsEl.textContent = String(value);
    }

    function updateLikeCount(cardKey, value) {
      const button = listEl.querySelector(`[data-like-key="${CSS.escape(String(cardKey))}"]`);
      if (!button) return;
      const likeCountEl = button.querySelector('.article-like-count');
      if (likeCountEl) likeCountEl.textContent = String(value);
    }

    function renderCards(cards) {
      if (!Array.isArray(cards) || cards.length === 0) {
        statusEl.textContent = 'Nenhum artigo encontrado.';
        listEl.innerHTML = '';
        return;
      }

      statusEl.textContent = '';
      listEl.innerHTML = cards.map((card) => `
        <article class="article-card" role="listitem" data-article-key="${domain.safe(card.key)}" data-article-id="${card.id}" data-article-slug="${domain.safe(card.rawSlug)}">
          <a class="article-card-media" href="${card.articleUrl}" aria-label="Abrir artigo ${card.title}">
            ${card.cover
              ? `<img class="article-card-image" src="${card.cover}" alt="${card.title}" loading="lazy" decoding="async">`
              : '<div class="article-card-placeholder" aria-hidden="true"></div>'}
          </a>
          <div class="article-card-body">
            <div class="article-card-meta">
              <span>${card.readTime}</span>
              <span class="article-card-date">${card.publishedDate ? `Publicado em ${card.publishedDate}` : ''}</span>
            </div>
            <h3 class="article-card-title"><a href="${card.articleUrl}">${card.title}</a></h3>
            <p class="article-card-excerpt">${card.excerpt}</p>
          </div>
          <div class="article-card-footer">
            <div class="article-card-stats">
              <span class="article-stat article-views" aria-label="${card.views} visualizações">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 5c5.6 0 9.8 4.9 11 6.5.2.3.2.7 0 1C21.8 14 17.6 19 12 19S2.2 14 1 12.5a.8.8 0 0 1 0-1C2.2 9.9 6.4 5 12 5zm0 2C8 7 4.8 10.3 3.1 12 4.8 13.7 8 17 12 17s7.2-3.3 8.9-5C19.2 10.3 16 7 12 7zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z"/>
                </svg>
                <span class="article-views-count" data-views-key="${domain.safe(card.key)}">${card.views}</span>
              </span>
              <span class="article-stat article-comments" aria-label="${card.comments} comentários">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 3v7h14V7H5z"/>
                </svg>
                <span class="article-comments-count" data-comments-key="${domain.safe(card.key)}">${card.comments}</span>
              </span>
            </div>
            <button
              class="article-like-btn"
              type="button"
              data-like-btn
              data-article-id="${card.id}"
              data-like-key="${domain.safe(card.key)}"
              data-like-initial="${card.initialLikes}"
              aria-label="Curtir artigo"
            >
              <span class="article-like-count">${card.initialLikes}</span>
              <span class="article-heart" aria-hidden="true">❤</span>
              <span class="article-sparks" aria-hidden="true">
                <i></i><i></i><i></i><i></i><i></i><i></i>
              </span>
            </button>
          </div>
        </article>
      `).join('');
    }

    function initLikeButtons() {
      listEl.querySelectorAll('[data-like-btn]').forEach((btn) => {
        const key = btn.dataset.likeKey;
        const initial = domain.toInt(btn.dataset.likeInitial, 0);
        const articleId = String(btn.dataset.articleId || '').trim();
        const likedFromStorage = Boolean(articleId && storage.likedStorage[articleId]);

        if (!likesState.has(key)) {
          likesState.set(key, { liked: likedFromStorage, count: initial, pending: false });
        }

        btn.classList.toggle('is-liked', likedFromStorage);
      });
    }

    async function syncMetrics(cards) {
      const syncCandidates = cards.filter((card) => card.rawId || card.rawSlug);
      if (!syncCandidates.length) return;

      await Promise.all(syncCandidates.map(async (card) => {
        const update = await useCase.syncCardMetrics(card);

        if (Number.isFinite(update.views)) {
          updateViewCount(card.key, update.views);
          storage.mergeCachedMetrics(card.rawId, card.rawSlug, { views: update.views });
        }

        if (Number.isFinite(update.comments)) {
          updateCommentsCount(card.key, update.comments);
          storage.mergeCachedMetrics(card.rawId, card.rawSlug, { comments: update.comments });
        }

        if (Number.isFinite(update.likes)) {
          const state = likesState.get(card.key);
          if (state && !state.pending) {
            state.count = update.likes;
            likesState.set(card.key, state);
            updateLikeCount(card.key, update.likes);
          }
          storage.mergeCachedMetrics(card.rawId, card.rawSlug, { likes: update.likes });
        }
      }));
    }

    async function handleLikeClick(event) {
      const button = event.target.closest('[data-like-btn]');
      if (!button) return;

      const key = button.dataset.likeKey;
      const articleId = String(button.dataset.articleId || '').trim();
      const articleSlug = String(button.closest('.article-card')?.dataset.articleSlug || '').trim();
      if (!key || !likesState.has(key) || !articleId) return;

      event.preventDefault();
      event.stopPropagation();

      const state = likesState.get(key);
      if (state.pending) return;

      const nextLiked = !state.liked;
      const method = nextLiked ? 'POST' : 'DELETE';
      const prevLiked = state.liked;
      const prevCount = state.count;

      state.liked = nextLiked;
      state.count = Math.max(0, state.count + (nextLiked ? 1 : -1));
      state.pending = true;
      likesState.set(key, state);
      button.disabled = true;

      storage.likedStorage[articleId] = state.liked;
      storage.saveLikedStorage();

      const countEl = button.querySelector('.article-like-count');
      if (countEl) countEl.textContent = String(state.count);
      button.classList.toggle('is-liked', state.liked);
      storage.mergeCachedMetrics(articleId, articleSlug, { likes: state.count });

      button.classList.remove('is-animating');
      void button.offsetWidth;
      button.classList.add('is-animating');

      try {
        const payload = await useCase.sendLike(articleId, method, fingerprint);
        const serverLikes = domain.pickCount(payload, 'likes');
        if (Number.isFinite(serverLikes)) {
          state.count = serverLikes;
          if (countEl) countEl.textContent = String(state.count);
          storage.mergeCachedMetrics(articleId, articleSlug, { likes: state.count });
        }
      } catch (error) {
        if (isDomainError(error)) {
          console.error('Erro de dominio ao enviar like:', error.code, error.details || {});
        } else {
          console.error('Erro ao enviar like:', error);
        }
        state.liked = prevLiked;
        state.count = prevCount;
        storage.likedStorage[articleId] = state.liked;
        storage.saveLikedStorage();
        if (countEl) countEl.textContent = String(state.count);
        button.classList.toggle('is-liked', state.liked);
        storage.mergeCachedMetrics(articleId, articleSlug, { likes: state.count });
      } finally {
        state.pending = false;
        likesState.set(key, state);
        button.disabled = false;
      }
    }

    async function start() {
      statusEl.innerHTML = '<span class="articles-status-loading"><i aria-hidden="true"></i>Carregando artigos...</span>';

      try {
        const result = await useCase.execute();
        const cards = (Array.isArray(result.items) ? result.items : []).map((item, index) =>
          domain.toCardModel(item, index, {
            isPhpRuntime: config.isPhpRuntime,
            apiBase: config.apiBase,
            uploadsBase: config.uploadsBase,
            readCachedMetrics: storage.readCachedMetrics
          })
        );

        renderCards(cards);
        initLikeButtons();
        listEl.addEventListener('click', handleLikeClick);
        syncMetrics(cards);
      } catch (error) {
        statusEl.textContent = 'Não foi possível carregar os artigos agora.';
        listEl.innerHTML = '';
        if (isDomainError(error)) {
          console.error('Erro de dominio ao carregar artigos:', error.code, error.details || {});
        } else {
          console.error('Erro ao carregar artigos:', error);
        }
      }
    }

    return { start };
  }

  global.SiteAdvogadaArticlesController = {
    createArticlesController
  };
})(window);

(function registerArticlesRepository(global) {
  function createStorageAdapter(config, domain) {
    const {
      likedStorageKey,
      fingerprintStorageKey,
      metricsStorageKey
    } = config;

    const likedStorage = (() => {
      try {
        const raw = localStorage.getItem(likedStorageKey);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (_) {
        return {};
      }
    })();

    const metricsStorage = (() => {
      try {
        const raw = localStorage.getItem(metricsStorageKey);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (_) {
        return {};
      }
    })();

    function saveMetricsStorage() {
      try {
        localStorage.setItem(metricsStorageKey, JSON.stringify(metricsStorage));
      } catch (_) {}
    }

    function saveLikedStorage() {
      try {
        localStorage.setItem(likedStorageKey, JSON.stringify(likedStorage));
      } catch (_) {}
    }

    function buildMetricKeys(articleId, articleSlug) {
      const keys = [];
      const id = String(articleId || '').trim();
      const slug = String(articleSlug || '').trim();
      if (id) keys.push(`id:${id}`);
      if (slug) keys.push(`slug:${slug}`);
      return keys;
    }

    function readCachedMetrics(articleId, articleSlug) {
      const keys = buildMetricKeys(articleId, articleSlug);
      for (const key of keys) {
        const row = metricsStorage[key];
        if (row && typeof row === 'object') return row;
      }
      return null;
    }

    function mergeCachedMetrics(articleId, articleSlug, patch) {
      const keys = buildMetricKeys(articleId, articleSlug);
      if (!keys.length || !patch || typeof patch !== 'object') return;

      const cleanPatch = {};
      if (Number.isFinite(Number(patch.views))) cleanPatch.views = domain.toInt(patch.views, 0);
      if (Number.isFinite(Number(patch.likes))) cleanPatch.likes = domain.toInt(patch.likes, 0);
      if (Number.isFinite(Number(patch.comments))) cleanPatch.comments = domain.toInt(patch.comments, 0);
      if (!Object.keys(cleanPatch).length) return;

      for (const key of keys) {
        const current = metricsStorage[key] && typeof metricsStorage[key] === 'object' ? metricsStorage[key] : {};
        metricsStorage[key] = { ...current, ...cleanPatch, updatedAt: Date.now() };
      }
      saveMetricsStorage();
    }

    function getFingerprint() {
      try {
        const existing = localStorage.getItem(fingerprintStorageKey);
        if (existing) return existing;
        const generated = (window.crypto && window.crypto.randomUUID)
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
        localStorage.setItem(fingerprintStorageKey, generated);
        return generated;
      } catch (_) {
        return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      }
    }

    return {
      likedStorage,
      readCachedMetrics,
      mergeCachedMetrics,
      saveLikedStorage,
      getFingerprint
    };
  }

  function createHttpArticleRepository(config) {
    const {
      apiBase,
      apiUrl,
      staticIndexUrl
    } = config;

    async function fetchStaticArticles(limit) {
      const response = await fetch(staticIndexUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) return [];
      const payload = await response.json();
      return Array.isArray(payload) ? payload.slice(0, limit) : [];
    }

    async function fetchPublishedArticles() {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      return Array.isArray(payload) ? payload : (payload.data || []);
    }

    async function fetchArticleById(articleId) {
      const response = await fetch(`${apiBase}/articles/${encodeURIComponent(articleId)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) return null;
      return response.json();
    }

    async function fetchCommentsBySlug(slug) {
      const query = new URLSearchParams({
        slug,
        page: '1',
        pageSize: '1'
      });

      const response = await fetch(`${apiBase}/comments?${query.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) return null;
      return response.json();
    }

    async function sendLikeEvent(articleId, method, fingerprint) {
      const response = await fetch(`${apiBase}/articles/${encodeURIComponent(articleId)}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ fingerprint })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    }

    return {
      fetchStaticArticles,
      fetchPublishedArticles,
      fetchArticleById,
      fetchCommentsBySlug,
      sendLikeEvent
    };
  }

  global.SiteAdvogadaArticlesRepository = {
    createStorageAdapter,
    createHttpArticleRepository
  };
})(window);

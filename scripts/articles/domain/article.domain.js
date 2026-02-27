(function registerArticleDomain(global) {
  const VIEW_PATHS = [
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
  ];

  const LIKE_PATHS = [
    'likes',
    'likesCount',
    'stats.likes',
    'metrics.likes',
    'counters.likes',
    'data.likes',
    'data.likesCount',
    'article.likes',
    'article.likesCount',
    'result.likes',
    'result.likesCount'
  ];

  const COMMENT_PATHS = [
    'comments',
    'commentsCount',
    'commentCount',
    'stats.comments',
    'metrics.comments',
    'counters.comments'
  ];

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
      const parsed = toInt(current, Number.NaN);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
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

  function resolveCoverUrl(coverImage, apiBase, uploadsBase) {
    if (!coverImage) return '';
    const value = String(coverImage).trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('/uploads/')) return `${apiBase}${value}`;
    if (value.startsWith('uploads/')) return `${apiBase}/${value}`;
    return `${uploadsBase}/${encodeURIComponent(value)}`;
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
      const parsed = toInt(value, Number.NaN);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  }

  function toCardModel(item, index, options) {
    const {
      isPhpRuntime,
      apiBase,
      uploadsBase,
      readCachedMetrics
    } = options;

    const id = safe(item._id || '');
    const title = safe(item.title || 'Sem titulo');
    const rawContent = String(item.content || item.excerpt || '');
    const plainContent = rawContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const excerpt = safe(plainContent.slice(0, 180) + (plainContent.length > 180 ? '...' : ''));
    const cover = resolveCoverUrl(item.coverImage, apiBase, uploadsBase);
    const rawId = String(item._id || '').trim();
    const rawSlug = String(item.slug || '').trim();
    const cachedMetrics = readCachedMetrics(rawId, rawSlug);

    const viewsMetric = pickMetric(item, VIEW_PATHS);
    const views = Number.isFinite(toInt(cachedMetrics?.views, Number.NaN))
      ? toInt(cachedMetrics?.views, 0)
      : (viewsMetric ?? 0);

    const commentsMetric = pickMetric(item, COMMENT_PATHS);
    const comments = Number.isFinite(toInt(cachedMetrics?.comments, Number.NaN))
      ? toInt(cachedMetrics?.comments, 0)
      : (commentsMetric ?? 0);

    const initialLikes = Number.isFinite(toInt(cachedMetrics?.likes, Number.NaN))
      ? toInt(cachedMetrics?.likes, 0)
      : (pickMetric(item, LIKE_PATHS) ?? 0);

    const readTime = getReadTime(item.wordCount || rawContent);
    const publishedDate = formatArticleDate(item.publishedAt || item.createdAt || item.updatedAt);
    const key = id || `local-${index}`;
    const slugParam = rawSlug ? `&slug=${encodeURIComponent(rawSlug)}` : '';
    const staticSlug = slugifyPath(rawSlug || (rawId ? `id-${rawId}` : ''));
    const articleUrl = rawId
      ? (isPhpRuntime
        ? `article-detail.php?id=${encodeURIComponent(rawId)}${slugParam}`
        : `artigos/${encodeURIComponent(staticSlug)}/`)
      : '#';

    return {
      key,
      id,
      rawId,
      rawSlug,
      title,
      excerpt,
      cover,
      readTime,
      publishedDate,
      views,
      comments,
      initialLikes,
      articleUrl
    };
  }

  global.SiteAdvogadaArticlesDomain = {
    VIEW_PATHS,
    LIKE_PATHS,
    COMMENT_PATHS,
    safe,
    toInt,
    pickMetric,
    getReadTime,
    formatArticleDate,
    slugifyPath,
    resolveCoverUrl,
    pickCount,
    toCardModel
  };
})(window);

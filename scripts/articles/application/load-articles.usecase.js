(function registerLoadArticlesUseCase(global) {
  function createLoadArticlesUseCase(deps) {
    const {
      repository,
      domain,
      isPhpRuntime,
      domainError = {}
    } = deps;
    const createDomainError = domainError.createDomainError || ((code, message, details) => {
      const error = new Error(message || 'Domain error');
      error.name = 'DomainError';
      error.code = code || 'DOMAIN_ERROR';
      error.details = details && typeof details === 'object' ? details : {};
      return error;
    });

    async function execute() {
      if (!isPhpRuntime) {
        try {
          const staticItems = await repository.fetchStaticArticles(6);
          if (Array.isArray(staticItems) && staticItems.length > 0) {
            return { items: staticItems, source: 'static' };
          }
        } catch (_) {}
      }

      try {
        const apiItems = await repository.fetchPublishedArticles();
        return { items: apiItems, source: 'api' };
      } catch (error) {
        throw createDomainError('ARTICLES_LOAD_FAILED', 'Falha ao carregar artigos.', { cause: error });
      }
    }

    async function syncCardMetrics(card) {
      const update = {};

      try {
        if (card.rawId) {
          const articlePayload = await repository.fetchArticleById(card.rawId);
          if (articlePayload) {
            const viewsValue = domain.pickMetric(articlePayload, domain.VIEW_PATHS);
            if (Number.isFinite(viewsValue)) update.views = viewsValue;

            const likesValue = domain.pickMetric(articlePayload, domain.LIKE_PATHS);
            if (Number.isFinite(likesValue)) update.likes = likesValue;
          }
        }

        if (card.rawSlug) {
          const commentsPayload = await repository.fetchCommentsBySlug(card.rawSlug);
          const total = domain.toInt(commentsPayload?.total, Number.NaN);
          if (Number.isFinite(total)) update.comments = total;
        }
      } catch (_) {}

      return update;
    }

    async function sendLike(articleId, method, fingerprint) {
      try {
        return await repository.sendLikeEvent(articleId, method, fingerprint);
      } catch (error) {
        throw createDomainError('ARTICLES_LIKE_FAILED', 'Falha ao processar curtida.', {
          articleId,
          method,
          cause: error
        });
      }
    }

    return {
      execute,
      syncCardMetrics,
      sendLike
    };
  }

  global.SiteAdvogadaLoadArticlesUseCase = {
    createLoadArticlesUseCase
  };
})(window);

<section id="articles" class="articles-section container-fluid" aria-labelledby="articles-title">
  <div class="row center-xs">
    <div class="col-xs-12">
      <h2 id="articles-title" class="section-title section-title-green">Artigos</h2>
    </div>
  </div>

  <div class="row center-xs">
    <div class="col-xs-12 col-md-10">
      <p id="articles-status" aria-live="polite">
        <span class="articles-status-loading"><i aria-hidden="true"></i>Carregando artigos...</span>
      </p>
      <div id="articles-list" class="articles-grid" role="list"></div>
    </div>
  </div>
</section>

<script src="scripts/articles/domain/article.domain.js" defer></script>
<script src="scripts/articles/domain/domain.error.js" defer></script>
<script src="scripts/articles/adapters/articles.repository.js" defer></script>
<script src="scripts/articles/application/load-articles.usecase.js" defer></script>
<script src="scripts/articles/ui/articles.controller.js" defer></script>
<script src="scripts/articles/app.js" defer></script>

<section id="history" class="parallax">
  <div class="parallax-content container-fluid">
    <div class="row center-xs">
      <div class="col-xs-12">
        <h2 class="section-title section-title-light">História</h2>
      </div>
    </div>

    <div class="row middle-xs history-row">
      <div class="col-xs-12 col-md-7">
        <p class="history-main-text">
          Fundado pela advogada Maria Silva, nosso escritório nasceu da paixão pelo direito e da dedicação em oferecer soluções jurídicas claras e eficazes. Combinamos experiência prática e visão estratégica para atender clientes de diferentes setores, sempre com ética, transparência e proximidade.
        </p>
      </div>
      <div class="col-xs-12 col-md-5">
        <div class="history-reveal-card">
          <picture>
            <source
              type="image/avif"
              srcset="images/optimized/lawyer-320.avif 320w, images/optimized/lawyer-480.avif 480w"
              sizes="(min-width: 62em) 340px, 220px"
            >
            <source
              type="image/webp"
              srcset="images/optimized/lawyer-320.webp 320w, images/optimized/lawyer-480.webp 480w"
              sizes="(min-width: 62em) 340px, 220px"
            >
            <img src="images/optimized/lawyer-320.webp" alt="Advogada Maria Silva" loading="lazy" decoding="async" class="history-reveal-image">
          </picture>
          <div class="history-reveal-copy">
            <span class="history-reveal-name">Maria Silva</span>
            <span class="history-reveal-oab">OAB/XX XX.XXX</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<script src="scripts/history/domain/history.domain.js" defer></script>
<script src="scripts/history/application/init-history-reveal.usecase.js" defer></script>
<script src="scripts/history/ui/history.controller.js" defer></script>
<script src="scripts/history/app.js" defer></script>

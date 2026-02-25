<section id="about" class="about-section container-fluid">
  <div class="row center-xs about-row">
    <div class="col-xs-12">
      <h2 class="about-title hidden">Quem Somos</h2>
    </div>

    <div class="col-xs-12 col-md-5">
      <div class="about-image-card hidden">
        <picture>
          <source
            type="image/avif"
            srcset="images/optimized/building-480.avif 480w, images/optimized/building-800.avif 800w"
            sizes="(min-width: 64em) 400px, (min-width: 48em) 45vw, 92vw"
          >
          <source
            type="image/webp"
            srcset="images/optimized/building-480.webp 480w, images/optimized/building-800.webp 800w"
            sizes="(min-width: 64em) 400px, (min-width: 48em) 45vw, 92vw"
          >
          <img src="images/optimized/building-480.webp" alt="Advogada Maria Silva" loading="lazy" decoding="async" class="about-image">
        </picture>
      </div>
    </div>

    <div class="col-xs-12 col-md-7">
      <div class="about-text">
        <p class="hidden">
          Somos um escritório comprometido com a excelência, transparência e dedicação em cada caso que assumimos. Nossa missão é oferecer soluções jurídicas eficazes, sempre pautadas pela ética e pelo respeito às necessidades de nossos clientes.
        </p>
        <p class="hidden">
          Com uma equipe especializada e apaixonada pelo direito, buscamos não apenas defender interesses, mas também construir relações de confiança duradouras. Acreditamos que cada cliente merece atenção personalizada, clareza nas informações e segurança em cada decisão.
        </p>
        <p class="hidden">
          Nosso propósito é ser mais do que um escritório de advocacia: queremos ser parceiros na construção de caminhos sólidos e justos, contribuindo para transformar desafios em oportunidades.
        </p>
        <p class="hidden">Acreditamos que justiça se constrói com transparência, confiança e proximidade.</p>
        <p class="hidden">
          Ao longo de nossa trajetória, acumulamos experiência em diversas áreas do direito, sempre com foco em oferecer soluções práticas e seguras. Nosso compromisso é acompanhar cada cliente em todas as etapas, garantindo suporte jurídico sólido e construindo relações duradouras baseadas na confiança e no respeito.
        </p>
      </div>
    </div>
  </div>
</section>

<script>
  const elements = document.querySelectorAll('.hidden');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  });

  elements.forEach(el => observer.observe(el));
</script>

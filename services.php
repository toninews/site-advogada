<section id="services" class="area-destaque container-fluid">
  <video
    class="area-destaque-video"
    autoplay
    muted
    loop
    playsinline
    preload="metadata"
    poster="images/optimized/direito-criminal-768.webp"
    aria-hidden="true"
  >
    <source src="videos/services-optimized.mp4" type="video/mp4" />
  </video>
  <div class="overlay"></div>

  <div class="row center-xs">
    <div class="col-xs-12">
      <h2 class="section-title section-title-light">Serviços</h2>
    </div>
  </div>

  <div class="row center-xs area-destaque-row">
    <div class="col-xs-12 col-md-4">
      <div class="conteudo service-card" style="--service-delay: 0ms;">
        <h3>Consultoria Jurídica</h3>
        <p> Oferecemos orientação preventiva completa para empresas e pessoas físicas, ajudando a identificar riscos legais antes que se tornem problemas. Nossa consultoria inclui análise de contratos, revisão de práticas empresariais, suporte em tomadas de decisão estratégicas e acompanhamento contínuo para garantir conformidade com a legislação vigente. O objetivo é proporcionar segurança jurídica, reduzir custos com litígios e fortalecer a confiança em cada etapa do seu negócio.</p>
        <a href="https://wa.me/5500000000000?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20consultoria%20jur%C3%ADdica." class="btn btn-services" target="_blank" rel="noopener noreferrer">Agendar Consultoria</a>
      </div>
    </div>

    <div class="col-xs-12 col-md-4">
      <div class="conteudo service-card" style="--service-delay: 90ms;">
        <h3>Contratos</h3>
        <p> Elaboramos e revisamos contratos com foco em clareza, segurança e conformidade legal. Nosso trabalho garante que todas as cláusulas estejam alinhadas com a legislação vigente, protegendo os interesses de nossos clientes e prevenindo litígios futuros. Atuamos em contratos empresariais, civis, trabalhistas e comerciais, oferecendo suporte personalizado para cada situação. O objetivo é assegurar relações jurídicas sólidas e transparentes, transmitindo confiança em cada negociação.</p>
        <a href="https://wa.me/5500000000000?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20revis%C3%A3o%20de%20contrato." class="btn btn-services" target="_blank" rel="noopener noreferrer">Solicitar Revisão</a>
      </div>
    </div>

    <div class="col-xs-12 col-md-4">
      <div class="conteudo service-card" style="--service-delay: 180ms;">
        <h3>Defesa em Processos</h3>
        <p> Representamos nossos clientes em processos judiciais com dedicação e estratégia, buscando sempre a melhor solução para cada caso. Nossa atuação inclui defesa em ações cíveis, trabalhistas, empresariais e familiares, com acompanhamento completo em todas as fases processuais. Trabalhamos para proteger direitos, reduzir riscos e alcançar resultados favoráveis, oferecendo suporte jurídico firme e comprometido. Cada processo é tratado com atenção individualizada, garantindo que o cliente se sinta amparado e confiante durante todo o percurso.</p>
        <a href="https://wa.me/5500000000000?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20sobre%20um%20processo." class="btn btn-services" target="_blank" rel="noopener noreferrer">Falar sobre Processo</a>
      </div>
    </div>
    
  </div>
</section>

<script>
(() => {
  const cards = document.querySelectorAll('.service-card');
  const section = document.querySelector('#services');
  if (!cards.length || !section) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        cards.forEach((card) => card.classList.add('is-visible'));
      } else {
        cards.forEach((card) => card.classList.remove('is-visible'));
      }
    });
  }, { threshold: 0.22, rootMargin: '0px 0px -10% 0px' });

  observer.observe(section);
})();
</script>

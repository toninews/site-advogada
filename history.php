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
          <img src="images/optimized/lawyer-320.webp" srcset="images/optimized/lawyer-320.webp 320w, images/optimized/lawyer-480.webp 480w" sizes="(min-width: 62em) 340px, 220px" alt="Advogada Maria Silva" loading="lazy" decoding="async" class="history-reveal-image">
          <div class="history-reveal-copy">
            <span class="history-reveal-name">Maria SilvaBBB</span>
            <span class="history-reveal-oab">OAB/XX XX.XXX11222</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<script>
document.addEventListener("DOMContentLoaded", () => {
  const revealCard = document.querySelector(".history-reveal-card");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const mainText = entry.target.querySelector(".history-main-text");
      if (!mainText) return;

      if (entry.isIntersecting) {
        mainText.classList.add("show");
      } else {
        mainText.classList.remove("show");
      }
    });
  }, { threshold: 0.2 });

  const parallaxSection = document.querySelector("#history");
  if (parallaxSection) {
    observer.observe(parallaxSection);
  }

  if (revealCard) {
    revealCard.addEventListener("click", (event) => {
      if (!window.matchMedia("(max-width: 980px)").matches) return;
      revealCard.classList.toggle("is-open");
      event.stopPropagation();
    });

    document.addEventListener("click", (event) => {
      if (!window.matchMedia("(max-width: 980px)").matches) return;
      if (!revealCard.contains(event.target)) {
        revealCard.classList.remove("is-open");
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 981px)").matches) {
        revealCard.classList.remove("is-open");
      }
    });
  }
});
</script>

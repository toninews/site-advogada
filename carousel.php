  <div class="carousel">

  <div class="carousel-item active">
    <picture>
      <source
        type="image/avif"
        srcset="images/optimized/direito-criminal-480.avif 480w, images/optimized/direito-criminal-640.avif 640w, images/optimized/direito-criminal-768.avif 768w, images/optimized/direito-criminal-1280.avif 1280w, images/optimized/direito-criminal-1600.avif 1600w"
        sizes="100vw"
      >
      <source
        type="image/webp"
        srcset="images/optimized/direito-criminal-480.webp 480w, images/optimized/direito-criminal-640.webp 640w, images/optimized/direito-criminal-768.webp 768w, images/optimized/direito-criminal-1280.webp 1280w, images/optimized/direito-criminal-1600.webp 1600w"
        sizes="100vw"
      >
      <img
        src="images/optimized/direito-criminal-640.webp"
        alt="Direito Criminal"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        width="1600"
        height="900"
      >
    </picture>
    <div class="carousel-caption">
      <p class="carousel-subtitle">Defesa que protege.</p>
      <h2 class="with-shadow">Direito Criminal</h2>
    </div>
  </div>

  <div class="carousel-item">
    <picture>
      <source
        type="image/avif"
        srcset="images/optimized/direito-previdenciario-768.avif 768w, images/optimized/direito-previdenciario-1280.avif 1280w, images/optimized/direito-previdenciario-1600.avif 1600w"
        sizes="100vw"
      >
      <source
        type="image/webp"
        srcset="images/optimized/direito-previdenciario-768.webp 768w, images/optimized/direito-previdenciario-1280.webp 1280w, images/optimized/direito-previdenciario-1600.webp 1600w"
        sizes="100vw"
      >
      <img
        src="images/optimized/direito-previdenciario-1280.webp"
        alt="Direito Previdenciario"
        loading="eager"
        decoding="async"
        width="1600"
        height="900"
      >
    </picture>
    <div class="carousel-caption">
      <p class="carousel-subtitle">Segurança para o seu futuro.</p>
      <h2 class="with-shadow">Direito Previdenciario</h2>
    </div>
  </div>

    <div class="carousel-item">
    <picture>
      <source
        type="image/avif"
        srcset="images/optimized/direito-consumidor-768.avif 768w, images/optimized/direito-consumidor-1280.avif 1280w, images/optimized/direito-consumidor-1600.avif 1600w"
        sizes="100vw"
      >
      <source
        type="image/webp"
        srcset="images/optimized/direito-consumidor-768.webp 768w, images/optimized/direito-consumidor-1280.webp 1280w, images/optimized/direito-consumidor-1600.webp 1600w"
        sizes="100vw"
      >
      <img
        src="images/optimized/direito-consumidor-1280.webp"
        alt="Direito do Consumidor"
        loading="lazy"
        decoding="async"
        width="1600"
        height="900"
      >
    </picture>
    <div class="carousel-caption">
      <p class="carousel-subtitle">Seus direitos em primeiro lugar.</p>
      <h2 class="with-shadow">Direito do Consumidor</h2>
    </div>
  </div>

    <div class="carousel-item">
    <picture>
      <source
        type="image/avif"
        srcset="images/optimized/direito-trabalhista-768.avif 768w, images/optimized/direito-trabalhista-1280.avif 1280w, images/optimized/direito-trabalhista-1600.avif 1600w"
        sizes="100vw"
      >
      <source
        type="image/webp"
        srcset="images/optimized/direito-trabalhista-768.webp 768w, images/optimized/direito-trabalhista-1280.webp 1280w, images/optimized/direito-trabalhista-1600.webp 1600w"
        sizes="100vw"
      >
      <img
        src="images/optimized/direito-trabalhista-1280.webp"
        alt="Direito Trabalhista"
        loading="lazy"
        decoding="async"
        width="1600"
        height="900"
      >
    </picture>
    <div class="carousel-caption">
      <p class="carousel-subtitle">Respeito e justiça no trabalho.</p>
      <h2 class="with-shadow">Direito Trabalhista</h2>
    </div>
  </div>
  
  <button class="prev" type="button" aria-label="Slide anterior">&#10094;</button>
  <button class="next" type="button" aria-label="Próximo slide">&#10095;</button>
  <div class="pagination">
    <button class="pagination-button active"><span class="visually-hidden">Ir para slide 1</span></button>
    <button class="pagination-button"><span class="visually-hidden">Ir para slide 2</span></button>
    <button class="pagination-button"><span class="visually-hidden">Ir para slide 3</span></button>
    <button class="pagination-button"><span class="visually-hidden">Ir para slide 4</span></button>
    <span class="pagination-current" aria-hidden="true"></span>
  </div>
</div>

<a
  class="whatsapp-float-btn"
  href="https://wa.me/5500000000000"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Conversar no WhatsApp"
>
  <span class="whatsapp-float-icon" aria-hidden="true">✆</span>
  <span>Chamar no WhatsApp</span>
</a>

<script>
(() => {
  const slides = document.querySelectorAll('.carousel-item');
  const dots = document.querySelectorAll('.pagination-button');
  const currentIndicator = document.querySelector('.pagination-current');
  const carouselElement = document.querySelector('.carousel');
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  const AUTOPLAY_DELAY = 6500;
  let currentSlide = 0;
  let autoPlayTimer = null;
  let autoPlayPaused = false;

  if (!slides.length || !carouselElement) return;

  function updateIndicatorPosition(index) {
    if (!currentIndicator) return;
    currentIndicator.style.transform = `translateX(calc(${index} * var(--pagination-step)))`;
  }

  function showSlide(index) {
    slides.forEach((slide, i) => {
      const isActive = i === index;
      slide.classList.toggle('active', isActive);
      if (dots[i]) dots[i].classList.toggle('active', isActive);
    });
    updateIndicatorPosition(index);
  }

  function clearAutoPlay() {
    if (!autoPlayTimer) return;
    clearTimeout(autoPlayTimer);
    autoPlayTimer = null;
  }

  function scheduleAutoPlay() {
    clearAutoPlay();
    if (autoPlayPaused) return;
    autoPlayTimer = setTimeout(() => {
      moveSlide(1, true);
      scheduleAutoPlay();
    }, AUTOPLAY_DELAY);
  }

  function goToSlide(index, fromAutoPlay = false) {
    const normalizedIndex = (index + slides.length) % slides.length;
    if (normalizedIndex === currentSlide) {
      if (!fromAutoPlay) scheduleAutoPlay();
      return;
    }
    currentSlide = normalizedIndex;
    showSlide(currentSlide);
    if (!fromAutoPlay) scheduleAutoPlay();
  }

  function moveSlide(step, fromAutoPlay = false) {
    goToSlide(currentSlide + step, fromAutoPlay);
  }

  function warmUpNextSlides() {
    slides.forEach((slide, index) => {
      if (index === 0) return;
      const image = slide.querySelector('img');
      if (!image) return;
      image.loading = 'eager';
      if (image.decode) image.decode().catch(() => {});
    });
  }

  prevButton?.addEventListener('click', () => moveSlide(-1));
  nextButton?.addEventListener('click', () => moveSlide(1));

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  carouselElement.addEventListener('mouseenter', () => {
    autoPlayPaused = true;
    clearAutoPlay();
  });

  carouselElement.addEventListener('mouseleave', () => {
    autoPlayPaused = false;
    scheduleAutoPlay();
  });

  document.addEventListener('visibilitychange', () => {
    autoPlayPaused = document.hidden;
    if (autoPlayPaused) clearAutoPlay();
    else scheduleAutoPlay();
  });

  window.addEventListener('resize', () => {
    updateIndicatorPosition(currentSlide);
  });

  if ('requestIdleCallback' in window) {
    requestIdleCallback(warmUpNextSlides, { timeout: 1200 });
  } else {
    setTimeout(warmUpNextSlides, 240);
  }

  showSlide(currentSlide);
  scheduleAutoPlay();
})();
</script>

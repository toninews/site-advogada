  <div class="carousel">

  <div class="carousel-item active">
    <img
      src="images/optimized/direito-criminal-1280.webp"
      srcset="images/optimized/direito-criminal-768.webp 768w, images/optimized/direito-criminal-1280.webp 1280w, images/optimized/direito-criminal-1600.webp 1600w"
      sizes="100vw"
      alt="Direito Criminal"
      loading="eager"
      fetchpriority="high"
      decoding="async"
      width="1600"
      height="900"
    >
    <div class="carousel-caption">
      <p class="carousel-subtitle">Defesa que protege.</p>
      <h2 class="with-shadow">Direito Criminal</h2>
      <a
        class="carousel-cta carousel-whatsapp-btn"
        href="https://wa.me/5500000000000"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chamar no WhatsApp"
      >CHAMAR WHATSAPP</a>
    </div>
  </div>

  <div class="carousel-item">
    <img
      src="images/optimized/direito-consumidor-1280.webp"
      srcset="images/optimized/direito-consumidor-768.webp 768w, images/optimized/direito-consumidor-1280.webp 1280w, images/optimized/direito-consumidor-1600.webp 1600w"
      sizes="100vw"
      alt="Direito do Consumidor"
      loading="lazy"
      decoding="async"
      width="1600"
      height="900"
    >
    <div class="carousel-caption">
      <p class="carousel-subtitle">Segurança para o seu futuro.</p>
      <h2 class="with-shadow">Direito Previdenciario</h2>
      <a
        class="carousel-cta carousel-whatsapp-btn"
        href="https://wa.me/555332012577"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chamar no WhatsApp"
      >CHAMAR WHATSAPP</a>
    </div>
  </div>

    <div class="carousel-item">
    <img
      src="images/optimized/direito-consumidor-1280.webp"
      srcset="images/optimized/direito-consumidor-768.webp 768w, images/optimized/direito-consumidor-1280.webp 1280w, images/optimized/direito-consumidor-1600.webp 1600w"
      sizes="100vw"
      alt="Direito do Consumidor"
      loading="lazy"
      decoding="async"
      width="1600"
      height="900"
    >
    <div class="carousel-caption">
      <p class="carousel-subtitle">Seus direitos em primeiro lugar.</p>
      <h2 class="with-shadow">Direito do Consumidor</h2>
      <a
        class="carousel-cta carousel-whatsapp-btn"
        href="https://wa.me/555332012577"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chamar no WhatsApp"
      >CHAMAR WHATSAPP</a>
    </div>
  </div>

    <div class="carousel-item">
    <img
      src="images/optimized/direito-consumidor-1280.webp"
      srcset="images/optimized/direito-consumidor-768.webp 768w, images/optimized/direito-consumidor-1280.webp 1280w, images/optimized/direito-consumidor-1600.webp 1600w"
      sizes="100vw"
      alt="Direito do Consumidor"
      loading="lazy"
      decoding="async"
      width="1600"
      height="900"
    >
    <div class="carousel-caption">
      <p class="carousel-subtitle">Respeito e justiça no trabalho.</p>
      <h2 class="with-shadow">Direito Trabalhista</h2>
      <a
        class="carousel-cta carousel-whatsapp-btn"
        href="https://wa.me/555332012577"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chamar no WhatsApp"
      >CHAMAR WHATSAPP</a>
    </div>
  </div>
  
  <button class="prev" onclick="moveSlide(-1)">&#10094;</button>
  <button class="next" onclick="moveSlide(1)">&#10095;</button>
  <div class="pagination">
    <button class="pagination-button active"><span class="visually-hidden">Ir para slide 1</span></button>
    <button class="pagination-button"><span class="visually-hidden">Ir para slide 2</span></button>
    <button class="pagination-button"><span class="visually-hidden">Ir para slide 3</span></button>
    <button class="pagination-button"><span class="visually-hidden">Ir para slide 4</span></button>
    <span class="pagination-current" aria-hidden="true"></span>
  </div>
</div>

<script>
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');
const dots = document.querySelectorAll('.pagination-button');
const currentIndicator = document.querySelector('.pagination-current');
const carouselElement = document.querySelector('.carousel');
const AUTOPLAY_DELAY = 6500;
let autoPlayTimer;

function updateIndicatorPosition(index) {
  if (!currentIndicator || !dots[index]) return;
  const targetOffset = dots[index].offsetLeft;
  currentIndicator.style.transform = `translateX(${targetOffset}px)`;
}

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (dots[i]) dots[i].classList.remove('active');
    if (i === index) {
      slide.classList.add('active');
      if (dots[i]) dots[i].classList.add('active');
    }
  });

  updateIndicatorPosition(index);
}

function moveSlide(step, fromAutoPlay = false) {
  currentSlide = (currentSlide + step + slides.length) % slides.length;
  showSlide(currentSlide);
  if (!fromAutoPlay) restartAutoPlay();
}

function restartAutoPlay() {
  if (autoPlayTimer) clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(() => {
    moveSlide(1, true);
  }, AUTOPLAY_DELAY);
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    currentSlide = i;
    showSlide(currentSlide);
    restartAutoPlay();
  });
});

if (carouselElement) {
  carouselElement.addEventListener('mouseenter', () => {
    restartAutoPlay();
  });

  carouselElement.addEventListener('mouseleave', () => {
    restartAutoPlay();
  });
}

window.addEventListener('resize', () => {
  updateIndicatorPosition(currentSlide);
});

showSlide(currentSlide);
restartAutoPlay();
</script>

(function registerCarouselController(global) {
  function createCarouselController(deps) {
    const { useCase } = deps;

    const slides = Array.from(document.querySelectorAll('.carousel-item'));
    const dots = Array.from(document.querySelectorAll('.pagination-button'));
    const currentIndicator = document.querySelector('.pagination-current');
    const carouselElement = document.querySelector('.carousel');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    if (!slides.length || !carouselElement) {
      return { start: () => {} };
    }

    let currentSlide = 0;
    let autoPlayTimer = null;
    let autoPlayPaused = false;

    function updateIndicatorPosition(plan, index) {
      if (!currentIndicator) return;
      currentIndicator.style.transform = plan.indicatorTransform(index);
    }

    function showSlide(plan, index) {
      slides.forEach((slide, i) => {
        const isActive = i === index;
        slide.classList.toggle('active', isActive);
        if (dots[i]) dots[i].classList.toggle('active', isActive);
      });
      updateIndicatorPosition(plan, index);
    }

    function clearAutoPlay() {
      if (!autoPlayTimer) return;
      clearTimeout(autoPlayTimer);
      autoPlayTimer = null;
    }

    function scheduleAutoPlay(plan, moveSlideFn) {
      clearAutoPlay();
      if (autoPlayPaused) return;
      autoPlayTimer = setTimeout(() => {
        moveSlideFn(1, true);
        scheduleAutoPlay(plan, moveSlideFn);
      }, plan.autoplayDelayMs);
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

    function start() {
      const plan = useCase.buildPlan();

      function goToSlide(index, fromAutoPlay = false) {
        const normalizedIndex = plan.normalizeIndex(index, slides.length);
        if (normalizedIndex === currentSlide) {
          if (!fromAutoPlay) scheduleAutoPlay(plan, moveSlide);
          return;
        }
        currentSlide = normalizedIndex;
        showSlide(plan, currentSlide);
        if (!fromAutoPlay) scheduleAutoPlay(plan, moveSlide);
      }

      function moveSlide(step, fromAutoPlay = false) {
        goToSlide(currentSlide + step, fromAutoPlay);
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
        scheduleAutoPlay(plan, moveSlide);
      });

      document.addEventListener('visibilitychange', () => {
        autoPlayPaused = document.hidden;
        if (autoPlayPaused) clearAutoPlay();
        else scheduleAutoPlay(plan, moveSlide);
      });

      window.addEventListener('resize', () => {
        updateIndicatorPosition(plan, currentSlide);
      });

      if ('requestIdleCallback' in window) {
        requestIdleCallback(warmUpNextSlides, { timeout: plan.idleWarmupTimeoutMs });
      } else {
        setTimeout(warmUpNextSlides, plan.warmupDelayMs);
      }

      showSlide(plan, currentSlide);
      scheduleAutoPlay(plan, moveSlide);
    }

    return { start };
  }

  global.SiteAdvogadaCarouselController = {
    createCarouselController
  };
})(window);

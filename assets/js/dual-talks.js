(function () {
  'use strict';

  function initCarousel(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.dual-talks-carousel__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.dual-talks-carousel__dot'));
    var prev = root.querySelector('[data-talks-prev]');
    var next = root.querySelector('[data-talks-next]');
    if (!slides.length) return;

    var current = 0;
    var timer = null;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render() {
      slides.forEach(function (slide, index) {
        slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-far');
        var diff = (index - current + slides.length) % slides.length;
        var reverse = (current - index + slides.length) % slides.length;
        if (index === current) slide.classList.add('is-active');
        else if (diff === 1) slide.classList.add('is-next');
        else if (reverse === 1) slide.classList.add('is-prev');
        else slide.classList.add('is-far');
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
        dot.setAttribute('aria-current', index === current ? 'true' : 'false');
      });
    }

    function go(index) {
      current = (index + slides.length) % slides.length;
      render();
      restart();
    }

    function restart() {
      if (timer) clearInterval(timer);
      if (!reduced && slides.length > 1) {
        timer = setInterval(function () { go(current + 1); }, 5200);
      }
    }

    if (prev) prev.addEventListener('click', function () { go(current - 1); });
    if (next) next.addEventListener('click', function () { go(current + 1); });
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () { go(index); });
    });

    root.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    root.addEventListener('mouseleave', restart);
    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') go(current - 1);
      if (event.key === 'ArrowRight') go(current + 1);
    });

    render();
    restart();
  }

  function initAlbums() {
    var lightbox = document.querySelector('.dual-talks-lightbox');
    if (!lightbox) return;

    var image = lightbox.querySelector('.dual-talks-lightbox__image');
    var title = lightbox.querySelector('[data-lightbox-title]');
    var counter = lightbox.querySelector('[data-lightbox-counter]');
    var close = lightbox.querySelector('[data-lightbox-close]');
    var prev = lightbox.querySelector('[data-lightbox-prev]');
    var next = lightbox.querySelector('[data-lightbox-next]');
    var albumImages = [];
    var albumTitle = '';
    var current = 0;
    var lastFocus = null;

    function render() {
      if (!albumImages.length) return;
      image.src = albumImages[current].src;
      image.alt = albumImages[current].alt || albumTitle;
      title.textContent = albumTitle;
      counter.textContent = (current + 1) + ' / ' + albumImages.length;
    }

    function openAlbum(button) {
      lastFocus = button;
      albumTitle = button.getAttribute('data-album-title') || 'Conference album';
      try {
        albumImages = JSON.parse(button.getAttribute('data-album-images') || '[]');
      } catch (e) {
        albumImages = [];
      }
      if (!albumImages.length) return;
      current = 0;
      render();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (close) close.focus();
    }

    function closeAlbum() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    function step(direction) {
      current = (current + direction + albumImages.length) % albumImages.length;
      render();
    }

    document.querySelectorAll('[data-talks-album]').forEach(function (button) {
      button.addEventListener('click', function () { openAlbum(button); });
    });
    if (close) close.addEventListener('click', closeAlbum);
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeAlbum();
    });
    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeAlbum();
      if (event.key === 'ArrowLeft') step(-1);
      if (event.key === 'ArrowRight') step(1);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-talks-carousel]').forEach(initCarousel);
    initAlbums();
  });
})();

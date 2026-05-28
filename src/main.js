/* ============================================================
   ХЕДЕР — тень при скролле
   ============================================================ */
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
}, { passive: true });

/* ============================================================
   БУРГЕР-МЕНЮ
   ============================================================ */
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileOverlay = document.querySelector('.mobile-menu__overlay');
const menuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
const menuCloseBtn = document.querySelector('.mobile-menu__close');

function openMenu() {
  mobileMenu.classList.add('is-open');
  mobileOverlay.classList.add('is-open');
  document.body.classList.add('menu-open');
  burger.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
}

function closeMenu() {
  mobileMenu.classList.remove('is-open');
  mobileOverlay.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

if (burger) {
  burger.addEventListener('click', () => {
    mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
}

if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);
menuLinks.forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMenu();
    closeModal();
    if (typeof closeLightbox === 'function') closeLightbox();
  }
});

/* ============================================================
   МАСКА ТЕЛЕФОНА
   ============================================================ */
function phoneMask(input) {
  function applyMask(raw) {
    let v = raw.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) v = '7' + v;
    v = v.slice(0, 11);
    let f = '+7';
    if (v.length > 1) f += ' (' + v.slice(1, 4);
    if (v.length >= 4) f += ') ' + v.slice(4, 7);
    if (v.length >= 7) f += '-' + v.slice(7, 9);
    if (v.length >= 9) f += '-' + v.slice(9, 11);
    return f;
  }

  input.addEventListener('keydown', function (e) {
    if (e.key !== 'Backspace') return;
    const { selectionStart: s, selectionEnd: end, value } = this;
    if (s !== end || s === 0) return;
    const charBefore = value[s - 1];
    if (/\d/.test(charBefore)) return; // digit — let browser delete it normally

    // Non-digit before cursor: skip formatting chars and delete the preceding digit
    e.preventDefault();
    let pos = s - 1;
    while (pos > 0 && !/\d/.test(value[pos - 1])) pos--;
    if (pos === 0) return;
    const next = value.slice(0, pos - 1) + value.slice(pos);
    this.value = applyMask(next);
  });

  input.addEventListener('input', function () {
    this.value = applyMask(this.value);
  });

  input.addEventListener('focus', function () {
    if (!this.value) this.value = '+7 ';
  });

  input.addEventListener('blur', function () {
    if (this.value === '+7 ' || this.value === '+7') this.value = '';
  });
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('7');
}

document.querySelectorAll('input[type="tel"]').forEach(phoneMask);

/* ============================================================
   FAQ — АККОРДЕОН
   ============================================================ */
document.querySelectorAll('.faq__item').forEach(item => {
  const btn = item.querySelector('.faq__question');
  const answer = item.querySelector('.faq__answer');

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    document.querySelectorAll('.faq__item.is-open').forEach(open => {
      open.classList.remove('is-open');
      open.querySelector('.faq__answer').style.maxHeight = '';
      open.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  btn.setAttribute('aria-expanded', 'false');
});

/* ============================================================
   СЛАЙДЕР — универсальная фабрика
   ============================================================ */
function createSlider(options) {
  const { trackSelector, prevSelector, nextSelector, dotsSelector, slidesPerView, gap } = options;

  const track = document.querySelector(trackSelector);
  if (!track) return;

  const prev = document.querySelector(prevSelector);
  const next = document.querySelector(nextSelector);
  const dotsContainer = document.querySelector(dotsSelector);

  const slides = Array.from(track.children);
  let current = 0;
  let perView = slidesPerView();

  function getSlideWidth() {
    const trackWidth = track.parentElement.clientWidth;
    return (trackWidth - gap * (perView - 1)) / perView;
  }

  function goTo(index) {
    const count = slides.length;
    const maxIndex = Math.max(0, count - perView);
    current = Math.max(0, Math.min(index, maxIndex));

    const slideWidth = getSlideWidth();
    const offset = current * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current >= maxIndex;

    if (dotsContainer) {
      dotsContainer.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
      });
    }
  }

  function setSlideWidths() {
    perView = slidesPerView();
    const slideWidth = getSlideWidth();
    slides.forEach(slide => {
      slide.style.minWidth = slideWidth + 'px';
      slide.style.width = slideWidth + 'px';
    });
    goTo(current);
  }

  function buildDots() {
    if (!dotsContainer) return;
    const maxIndex = Math.max(0, slides.length - perView);
    const navEl = dotsContainer.closest('.slider-nav');
    if (navEl) navEl.hidden = maxIndex === 0;

    const dotCount = Math.max(1, slides.length - perView + 1);
    dotsContainer.innerHTML = '';
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  if (prev) prev.addEventListener('click', () => goTo(current - 1));
  if (next) next.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goTo(delta > 0 ? current + 1 : current - 1);
  }, { passive: true });

  buildDots();
  setSlideWidths();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      setSlideWidths();
    }, 150);
  }, { passive: true });
}

createSlider({
  trackSelector:  '.doctors__slider',
  prevSelector:   '#doctors-prev',
  nextSelector:   '#doctors-next',
  dotsSelector:   '#doctors-dots',
  gap:            24,
  slidesPerView:  () => window.innerWidth >= 1024 ? 4
                      : window.innerWidth >= 768 ? 3
                      : window.innerWidth >= 480 ? 2 : 1.2,
});

createSlider({
  trackSelector:  '.reviews__slider',
  prevSelector:   '#reviews-prev',
  nextSelector:   '#reviews-next',
  dotsSelector:   '#reviews-dots',
  gap:            24,
  slidesPerView:  () => window.innerWidth >= 1024 ? 3
                      : window.innerWidth >= 640 ? 2 : 1,
});

/* ============================================================
   POPUP — ЗАПИСЬ НА ПРИЁМ
   ============================================================ */
const modal = document.querySelector('.modal');
const modalOverlay = modal ? modal.querySelector('.modal__overlay') : null;
const modalClose = modal ? modal.querySelector('.modal__close') : null;
const modalFirstInput = modal ? modal.querySelector('input, select, textarea') : null;

function openModal() {
  if (!modal) return;
  modal.classList.add('is-open');
  document.body.classList.add('modal-open');
  setTimeout(() => {
    if (modalFirstInput) modalFirstInput.focus();
  }, 300);
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-open-modal]').forEach(btn => {
  btn.addEventListener('click', openModal);
});

if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
if (modalClose) modalClose.addEventListener('click', closeModal);

/* ============================================================
   ЛАЙТБОКС ГАЛЕРЕИ
   ============================================================ */
const lightbox     = document.getElementById('gallery-lightbox');
const lightboxImg  = lightbox ? lightbox.querySelector('.lightbox__img') : null;
const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;

function openLightbox(src, alt) {
  if (!lightbox) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.classList.add('is-open');
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('is-open');
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

document.querySelectorAll('.gallery__item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (img) openLightbox(img.src, img.alt);
  });
});

if (lightbox) lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

/* ============================================================
   ОБРАБОТКА ФОРМ
   ============================================================ */
const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT;

function handleForm(form) {
  if (!form) return;

  const status = form.querySelector('.form__status');
  const submit = form.querySelector('[type="submit"]');
  const consent = form.querySelector('.form__checkbox');

  function setStatus(type, text) {
    if (!status) return;
    status.className = 'form__status is-' + type;
    status.textContent = text;
    status.setAttribute('aria-live', 'polite');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (consent && !consent.checked) {
      setStatus('error', 'Пожалуйста, дайте согласие на обработку данных');
      return;
    }

    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput && !isValidPhone(phoneInput.value)) {
      phoneInput.classList.add('is-error');
      setStatus('error', 'Введите корректный номер телефона');
      phoneInput.focus();
      return;
    }

    if (phoneInput) phoneInput.classList.remove('is-error');

    const data = Object.fromEntries(new FormData(form));

    submit.disabled = true;
    submit.textContent = 'Отправляем…';
    if (status) status.className = 'form__status';

    try {
      if (!FORM_ENDPOINT || FORM_ENDPOINT === 'FORM_ENDPOINT') {
        await new Promise(r => setTimeout(r, 800));
        setStatus('success', 'Заявка отправлена! Мы позвоним вам в течение 30 минут.');
        form.reset();
        if (typeof ym !== 'undefined') ym(window.__METRIKA_ID, 'reachGoal', 'form_submit_success');
      } else {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error('server_error');

        setStatus('success', 'Заявка отправлена! Мы позвоним вам в течение 30 минут.');
        form.reset();
        if (typeof ym !== 'undefined') ym(window.__METRIKA_ID, 'reachGoal', 'form_submit_success');
      }
    } catch {
      setStatus('error', 'Не удалось отправить заявку. Позвоните нам напрямую.');
      if (typeof ym !== 'undefined') ym(window.__METRIKA_ID, 'reachGoal', 'form_submit_error');
    } finally {
      submit.disabled = false;
      submit.textContent = submit.dataset.label || 'Записаться';
    }
  });
}

document.querySelectorAll('.js-form').forEach(handleForm);

/* ============================================================
   СОБЫТИЕ КЛИКА ПО ТЕЛЕФОНУ
   ============================================================ */
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof ym !== 'undefined') ym(window.__METRIKA_ID, 'reachGoal', 'phone_click');
  });
});

/* ============================================================
   КНОПКА «НАВЕРХ»
   ============================================================ */
const scrollTopBtn = document.querySelector('.scroll-top');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   COOKIE-БАННЕР
   ============================================================ */
const cookieBanner = document.querySelector('.cookie-banner');
const cookieAccept = document.querySelector('#cookie-accept');
const cookieDecline = document.querySelector('#cookie-decline');

if (cookieBanner && !localStorage.getItem('cookie_consent')) {
  setTimeout(() => cookieBanner.classList.add('is-visible'), 800);
}

function acceptCookies() {
  localStorage.setItem('cookie_consent', 'accepted');
  if (cookieBanner) {
    cookieBanner.classList.remove('is-visible');
    setTimeout(() => cookieBanner.remove(), 300);
  }
}

if (cookieAccept) cookieAccept.addEventListener('click', acceptCookies);
if (cookieDecline) {
  cookieDecline.addEventListener('click', () => {
    localStorage.setItem('cookie_consent', 'declined');
    if (cookieBanner) {
      cookieBanner.classList.remove('is-visible');
      setTimeout(() => cookieBanner.remove(), 300);
    }
  });
}

/* ============================================================
   ЯНДЕКС.МЕТРИКА
   ============================================================ */
const METRIKA_ID = import.meta.env.VITE_METRIKA_ID;
if (METRIKA_ID && METRIKA_ID !== 'METRIKA_ID') {
  window.__METRIKA_ID = METRIKA_ID;
  (function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    k=e.createElement(t);a=e.getElementsByTagName(t)[0];
    k.async=1;k.src=r;a.parentNode.insertBefore(k,a)
  })(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
  ym(METRIKA_ID,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});
}

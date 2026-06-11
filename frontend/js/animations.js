/* ===== BHUTANCARE ANIMATIONS JS ===== */

// 1. Scroll reveal - watches all fade-up, fade-left, fade-right, zoom-in, stagger
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function initScrollReveal() {
  document.querySelectorAll('.fade-up, .fade-left, .fade-right, .zoom-in, .stagger')
    .forEach(el => revealObserver.observe(el));
}

// 2. Ripple effect on all buttons and clickable cards
function createRipple(e) {
  const el = e.currentTarget;
  const existing = el.querySelector('.ripple');
  if (existing) existing.remove();

  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top  - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function initRipple() {
  const selectors = '.btn, .btn-primary, .btn-main, .btn-outline, .btn-secondary, .btn-danger, .filter-btn, .time-slot, .dept-card, .quick-card, .nav-item';
  document.querySelectorAll(selectors).forEach(el => {
    el.removeEventListener('click', createRipple);
    el.addEventListener('click', createRipple);
  });
}

// 3. Page enter animation
function initPageEnter() {
  const main = document.querySelector('.main-content, main, .card-wrap, .hero');
  if (main) main.classList.add('page-enter');
}

// 4. Auto add fade-up to common elements that don't have it
function autoAnimate() {
  const selectors = [
    '.card:not(.fade-up)',
    '.stat-card:not(.fade-up)',
    '.appt-card:not(.fade-up)',
    '.hosp-card:not(.fade-up)',
    '.service-card:not(.fade-up)',
    '.lab-card:not(.fade-up)',
    '.presc-card:not(.fade-up)',
    '.page-header-row:not(.fade-up)',
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('fade-up');
      el.style.transitionDelay = (i * 0.07) + 's';
      revealObserver.observe(el);
    });
  });
}

// 5. Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// 6. Navbar shrink on scroll
function initNavScroll() {
  const nav = document.querySelector('.topnav, nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
      nav.style.backdropFilter = 'blur(20px)';
    } else {
      nav.style.boxShadow = '';
    }
  }, { passive: true });
}

// Init everything on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initPageEnter();
  initScrollReveal();
  initRipple();
  autoAnimate();
  initSmoothScroll();
  initNavScroll();

  // Re-init ripple after any dynamic content loads
  setTimeout(initRipple, 1000);
});

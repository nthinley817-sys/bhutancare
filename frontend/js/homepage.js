// Hamburger menu
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
function openMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

hamburger.addEventListener('click', e => {
  e.stopPropagation();
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

mobileMenu.querySelectorAll('.mob-link, .mob-login-btn').forEach(el =>
  el.addEventListener('click', closeMenu)
);

document.addEventListener('click', e => {
  if (mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)) closeMenu();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Stat counters
function animateCounter(el, target, suffix) {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + suffix;
    if (current >= target) clearInterval(timer);
  }, 20);
}
const statsObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const num = entry.target.querySelector('[data-target]');
      if (num && !num.dataset.animated) {
        num.dataset.animated = 'true';
        animateCounter(num, parseInt(num.dataset.target), num.dataset.suffix || '+');
      }
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stat-item').forEach(el => statsObs.observe(el));

// Navbar shadow on scroll
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow = window.scrollY > 10
    ? '0 4px 24px rgba(26,71,49,0.12)'
    : '0 2px 16px rgba(26,71,49,0.07)';
}, { passive: true });

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', function () {
  document.body.classList.toggle('dark');
  const icon = document.getElementById('themeIcon');
  icon.className = document.body.classList.contains('dark')
    ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
});

// Active nav on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) current = s.id; });
  navLinks.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current ||
        (current === '' && a.getAttribute('href') === '#')) a.classList.add('active');
  });
}, { passive: true });

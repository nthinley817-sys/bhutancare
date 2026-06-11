document.addEventListener('DOMContentLoaded', function () { requireAuth(); });
function toggleVisit(header) {
  const body    = header.nextElementSibling;
  const chevron = header.querySelector('.chevron');
  body.classList.toggle('open');
  chevron.classList.toggle('open');
}

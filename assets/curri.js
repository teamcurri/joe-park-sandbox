document.querySelectorAll('.faq-item').forEach((item) => {
  const button = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-q').forEach((other) => {
      if (other === button) return;
      other.setAttribute('aria-expanded', 'false');
      other.parentElement.querySelector('.faq-a').hidden = true;
    });

    button.setAttribute('aria-expanded', String(!isOpen));
    answer.hidden = isOpen;
  });
});

/* Reveal on scroll. Deliberately a plain scroll handler rather than an
 * IntersectionObserver: observer entries are delivered asynchronously, so a
 * fast or programmatic scroll can leave elements permanently hidden. */
const pending = Array.from(document.querySelectorAll('.reveal'));
let queued = false;

function revealInView() {
  queued = false;
  const limit = window.innerHeight - 60;

  for (let i = pending.length - 1; i >= 0; i -= 1) {
    const el = pending[i];
    if (el.getBoundingClientRect().top > limit) continue;
    const delay = Number(el.dataset.revealDelay || 0);
    setTimeout(() => el.classList.add('is-visible'), delay);
    pending.splice(i, 1);
  }
}

function schedule() {
  if (queued || !pending.length) return;
  queued = true;
  requestAnimationFrame(revealInView);
}

revealInView();
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);

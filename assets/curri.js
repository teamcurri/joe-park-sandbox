const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* Count-up. The final value is the element's own text, so it is already correct
 * for no-JS, screen readers and reduced-motion — this only replays it. */
function countUp(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';

  const final = el.textContent;
  const match = final.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match || reduceMotion) return;

  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ''));
  if (!Number.isFinite(target)) return;

  const decimals = (digits.split('.')[1] || '').length;
  const grouped = digits.includes(',');
  const start = performance.now();
  const duration = 900;

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = target * eased;
    el.textContent =
      prefix +
      value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: grouped,
      }) +
      suffix;
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = final;
  }

  requestAnimationFrame(frame);
}

/* Delivery completion. The markup ships finished, so this rewinds to the first
 * step and replays — anything that stops the script leaves a completed card. */
function playDelivery(panel) {
  if (panel.dataset.played) return;
  panel.dataset.played = '1';
  if (reduceMotion) return;

  const steps = Array.from(panel.querySelectorAll('.dstep'));
  const state = panel.querySelector('.delivery-state');
  const finalState = state ? state.textContent : '';
  if (!steps.length) return;

  panel.classList.add('is-playing');
  steps.forEach((s) => s.classList.remove('is-done'));
  if (state) state.textContent = 'Booked';

  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add('is-done');
      if (!state) return;
      const title = step.querySelector('.dtitle');
      state.textContent = i === steps.length - 1 ? finalState : (title ? title.textContent : finalState);
      if (i === steps.length - 1) panel.classList.remove('is-playing');
    }, 550 + i * 750);
  });
}

/* Reveal on scroll. Deliberately a plain scroll handler rather than an
 * IntersectionObserver: observer entries are delivered asynchronously, so a
 * fast or programmatic scroll can leave elements permanently hidden. */
const pending = Array.from(document.querySelectorAll('.reveal'));
const header = document.querySelector('.site-header');
let queued = false;

function revealInView() {
  queued = false;
  const limit = window.innerHeight - 60;

  for (let i = pending.length - 1; i >= 0; i -= 1) {
    const el = pending[i];
    if (el.getBoundingClientRect().top > limit) continue;
    const delay = Number(el.dataset.revealDelay || 0);
    setTimeout(() => {
      el.classList.add('is-visible');
      if (el.hasAttribute('data-countup')) countUp(el);
      el.querySelectorAll('[data-countup]').forEach(countUp);
      el.querySelectorAll('[data-delivery]').forEach(playDelivery);
    }, delay);
    pending.splice(i, 1);
  }
}

function onScroll() {
  if (header) header.classList.toggle('is-stuck', window.scrollY > 8);
  if (queued || !pending.length) return;
  queued = true;
  requestAnimationFrame(revealInView);
}

revealInView();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

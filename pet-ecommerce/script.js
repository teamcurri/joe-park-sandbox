document.querySelectorAll('.faq-item').forEach((item) => {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  const icon = button.querySelector('i');

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('.faq-question').forEach((otherButton) => {
      if (otherButton === button) return;
      otherButton.setAttribute('aria-expanded', 'false');
      otherButton.parentElement.querySelector('.faq-answer').hidden = true;
      otherButton.querySelector('i').className = 'ph ph-plus';
    });

    button.setAttribute('aria-expanded', String(!isOpen));
    answer.hidden = isOpen;
    icon.className = isOpen ? 'ph ph-plus' : 'ph ph-minus';
  });
});

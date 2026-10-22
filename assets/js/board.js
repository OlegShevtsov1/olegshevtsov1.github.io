'use strict';
(() => {
  // Highlight a theme, without filtering away any project or requiring pointer input.
  // The cards remain navigable and discoverable to keyboard and screen reader users.
  const choices = document.querySelectorAll('[data-thread]');
  const cards = document.querySelectorAll('[data-themes]');
  choices.forEach(button => button.addEventListener('click', () => {
    choices.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const theme = button.dataset.thread;
    cards.forEach(card => card.classList.toggle('is-dim', theme !== 'all' && !card.dataset.themes.split(' ').includes(theme)));
  }));
})();

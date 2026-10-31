// Menu de navegação no celular
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
    menu.classList.toggle('is-open', !open);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      menu.classList.remove('is-open');
    }
  });
})();

// "Como funciona": troca o passo ativo e avança sozinho
(function () {
  var wrap = document.querySelector('[data-steps]');
  if (!wrap) return;
  var items = wrap.querySelectorAll('.step-item');
  var buttons = wrap.querySelectorAll('.step-btn');
  var panels = wrap.querySelectorAll('.flow-panel');
  var nodes = wrap.querySelectorAll('.flow-node');
  var lines = wrap.querySelectorAll('.flow-line');
  var dots = wrap.querySelectorAll('.flow-dots span');
  var atual = 0;
  var timer = null;
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mostrar(i) {
    atual = i;
    items.forEach(function (el, k) { el.classList.toggle('is-active', k === i); });
    buttons.forEach(function (el, k) { el.setAttribute('aria-pressed', String(k === i)); });
    panels.forEach(function (el, k) {
      el.hidden = k !== i;
      el.classList.toggle('is-in', k === i);
    });
    nodes.forEach(function (el, k) { el.classList.toggle('is-done', k <= i); });
    lines.forEach(function (el, k) { el.classList.toggle('is-done', k < i); });
    dots.forEach(function (el, k) { el.classList.toggle('is-active', k === i); });
  }

  function iniciar() {
    if (reduzido || timer) return;
    timer = setInterval(function () { mostrar((atual + 1) % items.length); }, 4000);
  }
  function parar() { clearInterval(timer); timer = null; }

  buttons.forEach(function (btn, i) {
    btn.addEventListener('click', function () { parar(); mostrar(i); });
  });
  wrap.addEventListener('mouseenter', parar);
  wrap.addEventListener('mouseleave', iniciar);
  wrap.addEventListener('focusin', parar);

  // Só anima quando a seção está visível
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? iniciar() : parar(); });
    }, { threshold: 0.3 }).observe(wrap);
  } else {
    iniciar();
  }
})();

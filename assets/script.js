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

// Calculadora de planos por número de unidades
(function () {
  var calc = document.querySelector('[data-calc]');
  if (!calc) return;
  var range = document.getElementById('unidades');
  var out = document.getElementById('unidadesOut');
  var LIMITE = 700; // acima disso: proposta sob medida

  // Preços mensais (R$) por plano, de acordo com o número de unidades
  var precos = {
    basico: function (u) { return u * 0.55; },
    pro: function (u) { return u <= 100 ? 116.35 : u <= 200 ? 168.35 : 168.35 + (u - 200) * 0.71; },
    premium: function (u) { return u <= 100 ? 214.80 : u <= 200 ? 310.80 : 310.80 + (u - 200) * 1.31; }
  };

  function reais(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function atualizar() {
    var u = Number(range.value);
    var acima = u > LIMITE;
    out.textContent = acima ? '700+' : String(u);
    range.setAttribute('aria-valuetext', acima ? 'Mais de 700 unidades' : u + ' unidades');
    range.style.setProperty('--p', ((u - range.min) / (range.max - range.min) * 100) + '%');
    document.querySelectorAll('[data-plan]').forEach(function (card) {
      var preco = card.querySelector('[data-preco]');
      var unidade = card.querySelector('[data-unidade]');
      var small = card.querySelector('.plan-price small');
      if (acima) {
        preco.textContent = 'Sob consulta';
        small.hidden = true;
        unidade.textContent = 'Proposta sob medida';
        return;
      }
      var valor = precos[card.getAttribute('data-plan')](u);
      preco.textContent = reais(valor);
      small.hidden = false;
      unidade.textContent = reais(valor / u) + ' por unidade ao mês';
    });
  }

  range.addEventListener('input', atualizar);
  atualizar();
})();

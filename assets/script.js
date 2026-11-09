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
    basico: function (u) { return Math.max(49.90, u * 0.55); }, // mínimo de R$ 49,90
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

// Demonstração: formulário em 4 passos que abre o WhatsApp com as respostas
(function () {
  var card = document.querySelector('[data-demo]');
  if (!card) return;
  var WA = '5516991608868';
  var steps = card.querySelectorAll('.demo-step');
  var bar = card.querySelector('[data-demo-bar]');
  var count = card.querySelector('[data-demo-count]');
  var live = card.querySelector('[data-demo-live]');
  var done = card.querySelector('[data-demo-done]');
  var error = card.querySelector('[data-demo-error]');
  var answers = {};
  var current = 1;

  function show(n) {
    current = n;
    steps.forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== n; });
    bar.style.width = (n * 25) + '%';
    count.textContent = n + ' de 4';
    live.textContent = 'Passo ' + n + ' de 4';
    var focusEl = card.querySelector('[data-step="' + n + '"] .demo-opt, [data-step="' + n + '"] input');
    if (focusEl) focusEl.focus({ preventScroll: true });
  }

  card.querySelectorAll('fieldset.demo-step').forEach(function (fs) {
    var key = fs.getAttribute('data-key');
    fs.querySelectorAll('.demo-opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fs.querySelectorAll('.demo-opt').forEach(function (b) { b.classList.remove('is-selected'); });
        btn.classList.add('is-selected');
        answers[key] = btn.textContent.trim();
        setTimeout(function () { show(current + 1); }, 150);
      });
    });
  });
  card.querySelectorAll('.demo-back').forEach(function (b) {
    b.addEventListener('click', function () { if (current > 1) show(current - 1); });
  });

  var form = card.querySelector('form.demo-step');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    if (!nome) { error.hidden = false; form.nome.focus(); return; }
    error.hidden = true;
    var cidade = form.cidade.value.trim();
    var msg = 'Olá! Quero solicitar uma demonstração do CondoPack.\n\n' +
      '*Nome:* ' + nome + '\n' +
      '*Sou:* ' + form.cargo.value + '\n' +
      (cidade ? '*Cidade:* ' + cidade + '\n' : '') +
      '*Tipo de condomínio:* ' + (answers.tipo || '-') + '\n' +
      '*Unidades:* ' + (answers.unidades || '-') + '\n' +
      '*Quando quero começar:* ' + (answers.inicio || '-');
    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    card.querySelector('[data-demo-link]').href = url;
    if (typeof window.fbq === 'function') { try { window.fbq('track', 'Lead'); } catch (err) {} }
    window.open(url, '_blank', 'noopener');
    steps.forEach(function (s) { s.hidden = true; });
    card.querySelector('.demo-progress').hidden = true;
    done.hidden = false;
  });
})();

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

// Calculadora de planos: residencial (por unidade) e comercial (por sala ou conjunto)
(function () {
  var calc = document.querySelector('[data-calc]');
  if (!calc) return;
  var range = document.getElementById('unidades');
  var out = document.getElementById('unidadesOut');
  var LIMITE = 700; // acima disso: proposta sob medida

  // Tabelas de preço (R$ por mês). Mantenha igual à TABELA_PRECOS_ do painel CondoPack Admin.
  //   POR_UNIDADE: valor por unidade com mínimo.
  //   FAIXAS: até 100, de 101 a 200, e acima de 200 + valor por unidade extra.
  var TABELAS = {
    residencial: {
      nome: 'unidades', umaUnidade: 'unidade',
      pergunta: 'Quantas unidades tem o seu condomínio?',
      ajuda: 'Arraste para ver o valor de cada plano. Acima de 700 unidades, fazemos uma proposta sob medida.',
      planos: {
        basico: { tipo: 'POR_UNIDADE', porUnidade: 0.55, minimo: 49.90 },
        pro: { tipo: 'POR_UNIDADE', porUnidade: 0.97, minimo: 133.80 },
        premium: { tipo: 'POR_UNIDADE', porUnidade: 1.79, minimo: 247.02 }
      }
    },
    comercial: {
      nome: 'salas', umaUnidade: 'sala',
      pergunta: 'Quantas salas ou conjuntos tem o prédio?',
      ajuda: 'Cada sala ou conjunto comercial conta como uma unidade. Acima de 700 salas, fazemos uma proposta sob medida.',
      planos: {
        basico: { tipo: 'POR_UNIDADE', porUnidade: 0.55, minimo: 49.90 },
        pro: { tipo: 'FAIXAS', ate100: 116.35, ate200: 168.35, extraAcima200: 0.71 },
        premium: { tipo: 'FAIXAS', ate100: 214.80, ate200: 310.80, extraAcima200: 1.31 }
      }
    }
  };
  var tipoAtual = 'residencial';

  function reais(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function preco(t, u) {
    if (t.tipo === 'POR_UNIDADE') return Math.max(t.minimo, u * t.porUnidade);
    return u <= 100 ? t.ate100 : u <= 200 ? t.ate200 : t.ate200 + (u - 200) * t.extraAcima200;
  }

  function regras(t, tab) {
    if (t.tipo === 'POR_UNIDADE') {
      return [
        reais(t.porUnidade) + ' por ' + tab.umaUnidade + ' ao mês',
        'Mínimo de ' + reais(t.minimo) + '/mês',
        'Ex.: 200 ' + tab.nome + ' = ' + reais(preco(t, 200)) + '/mês'
      ];
    }
    return [
      'Até 100 ' + tab.nome + ': ' + reais(t.ate100) + '/mês',
      'De 101 a 200: ' + reais(t.ate200) + '/mês',
      'Acima de 200: ' + reais(t.ate200) + ' + ' + reais(t.extraAcima200) + ' por ' + tab.umaUnidade + ' extra'
    ];
  }

  function trocarTipo(tipo) {
    tipoAtual = tipo;
    var tab = TABELAS[tipo];
    calc.querySelectorAll('[data-tipo]').forEach(function (b) {
      var ativo = b.getAttribute('data-tipo') === tipo;
      b.classList.toggle('is-active', ativo);
      b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
    calc.querySelector('[data-calc-pergunta]').textContent = tab.pergunta;
    calc.querySelector('[data-calc-nome]').textContent = tab.nome;
    calc.querySelector('[data-calc-ajuda]').textContent = tab.ajuda;
    document.querySelectorAll('[data-plan]').forEach(function (card) {
      var ul = card.querySelector('[data-regras]');
      if (!ul) return;
      var linhas = regras(tab.planos[card.getAttribute('data-plan')], tab);
      if (card.getAttribute('data-plan') === 'premium') linhas.unshift('Valores previstos para o lançamento');
      ul.innerHTML = '';
      linhas.forEach(function (txt) { var li = document.createElement('li'); li.textContent = txt; ul.appendChild(li); });
    });
    atualizar();
  }

  function atualizar() {
    var tab = TABELAS[tipoAtual];
    var u = Number(range.value);
    var acima = u > LIMITE;
    out.textContent = acima ? '700+' : String(u);
    range.setAttribute('aria-valuetext', acima ? 'Mais de 700 ' + tab.nome : u + ' ' + tab.nome);
    range.style.setProperty('--p', ((u - range.min) / (range.max - range.min) * 100) + '%');
    document.querySelectorAll('[data-plan]').forEach(function (card) {
      var precoEl = card.querySelector('[data-preco]');
      var unidade = card.querySelector('[data-unidade]');
      var small = card.querySelector('.plan-price small');
      if (acima) {
        precoEl.textContent = 'Sob consulta';
        small.hidden = true;
        unidade.textContent = 'Proposta sob medida';
        return;
      }
      var valor = preco(tab.planos[card.getAttribute('data-plan')], u);
      precoEl.textContent = reais(valor);
      small.hidden = false;
      unidade.textContent = reais(valor / u) + ' por ' + tab.umaUnidade + ' ao mês';
    });
  }

  calc.querySelectorAll('[data-tipo]').forEach(function (b) {
    b.addEventListener('click', function () { trocarTipo(b.getAttribute('data-tipo')); });
  });
  range.addEventListener('input', atualizar);
  trocarTipo('residencial');
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

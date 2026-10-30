/* ================= INDEX · região + promoção 2 por 1 =================
   - Dropdown "Sua Região" (usa as classes .aberto / .active do style.css)
   - Carrossel de promoções (setas, bolinhas, troca automática, swipe)
   - Botão "Garanta já o seu!" ativa a promoção (o desconto é calculado na sacola)
   - Depois que a promoção é usada num pedido, o banner some da tela
===================================================================== */
(function () {
  'use strict';

  const PROMO = 'sooshi-promo';      // 'ativa' | 'usada'  (mesma chave do sacola.js)
  const REGIAO = 'sooshi-regiao';

  const ler = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sem storage */ } };

  /* ---------- carrossel de promoções ---------- */
  function iniciarCarrossel() {
    const carrossel = document.querySelector('.promo-carrossel');
    if (!carrossel) return;

    const trilho = carrossel.querySelector('.promo-trilho');
    const tirar = (chave) => {
      const s = trilho.querySelector('[data-promo="' + chave + '"]');
      if (s) s.remove();
    };

    if (ler(PROMO) === 'usada') tirar('2por1');

    if (new Date().getDay() !== 2) tirar('terca');

    let slides = Array.from(trilho.children);
    if (!slides.length) { carrossel.remove(); return; }

    const prev = carrossel.querySelector('.promo-seta--prev');
    const next = carrossel.querySelector('.promo-seta--next');
    const caixaBolinhas = carrossel.querySelector('.promo-bolinhas');
    const INTERVALO = 6000;
    const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let atual = 0;
    let timer = null;
    let bolinhas = [];

    function montarBolinhas() {
      caixaBolinhas.innerHTML = '';
      bolinhas = slides.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'promo-bolinha';
        b.setAttribute('aria-label', 'Ir para a promoção ' + (i + 1));
        b.addEventListener('click', () => { ir(i); tocar(); });
        caixaBolinhas.appendChild(b);
        return b;
      });
      carrossel.classList.toggle('unico', slides.length < 2);
    }

    function ir(n) {
      atual = (n + slides.length) % slides.length;
      trilho.style.transform = 'translateX(-' + atual * 100 + '%)';
      slides.forEach((s, i) => {
        s.inert = i !== atual;                      
        s.setAttribute('aria-hidden', String(i !== atual));
      });
      bolinhas.forEach((b, i) => {
        b.classList.toggle('ativa', i === atual);
        b.setAttribute('aria-current', String(i === atual));
      });
    }

    function parar() { clearInterval(timer); timer = null; }
    function tocar() {
      parar();
      if (reduzMovimento || slides.length < 2) return;
      timer = setInterval(() => ir(atual + 1), INTERVALO);
    }


    window.addEventListener('sooshi-promo-usada', () => {
      const s = trilho.querySelector('[data-promo="2por1"]');
      if (!s) return;
      s.remove();
      slides = Array.from(trilho.children);
      if (!slides.length) { parar(); carrossel.remove(); return; }
      montarBolinhas();
      ir(Math.min(atual, slides.length - 1));
      tocar();
    });

    prev.addEventListener('click', () => { ir(atual - 1); tocar(); });
    next.addEventListener('click', () => { ir(atual + 1); tocar(); });


    carrossel.addEventListener('mouseenter', parar);
    carrossel.addEventListener('mouseleave', tocar);
    carrossel.addEventListener('focusin', parar);
    carrossel.addEventListener('focusout', tocar);
    document.addEventListener('visibilitychange', () => (document.hidden ? parar() : tocar()));

 
    carrossel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { ir(atual - 1); tocar(); }
      if (e.key === 'ArrowRight') { ir(atual + 1); tocar(); }
    });


    let x0 = null;
    carrossel.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; parar(); }, { passive: true });
    carrossel.addEventListener('touchend', (e) => {
      if (x0 !== null) {
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) ir(atual + (dx < 0 ? 1 : -1));
      }
      x0 = null;
      tocar();
    });

    montarBolinhas();
    ir(0);
    tocar();
  }

  function iniciar() {
    const botaoPromo = document.querySelector('[data-promo="2por1"] .promo__button');
    if (botaoPromo) {
      botaoPromo.addEventListener('click', () => {
        if (ler(PROMO) !== 'usada') gravar(PROMO, 'ativa');
      });
    }

    iniciarCarrossel();

    const caixa = document.getElementById('locationContainer');
    const btn = document.getElementById('locationBtn');
    const menu = document.getElementById('locationMenu');
    const rotulo = document.getElementById('selectedLocation');
    if (!caixa || !btn || !menu || !rotulo) return;

    const salva = ler(REGIAO);
    if (salva) rotulo.textContent = salva;

    const abrirFechar = (abrir) => {
      menu.classList.toggle('aberto', abrir);
      btn.classList.toggle('active', abrir);
      btn.setAttribute('aria-expanded', String(abrir));
    };

    btn.addEventListener('click', () => abrirFechar(!menu.classList.contains('aberto')));

    menu.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      rotulo.textContent = li.textContent.trim();
      gravar(REGIAO, rotulo.textContent);
      abrirFechar(false);
    });

    document.addEventListener('click', (e) => { if (!caixa.contains(e.target)) abrirFechar(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirFechar(false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
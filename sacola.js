/* ================= SACOLA · compartilhada por todas as páginas =================
   - Clicar em qualquer .prato adiciona 1 unidade (quantas vezes quiser)
   - Clicar no carrinho do topo abre a sacola (lateral no desktop, tela cheia no celular)
   - Tudo fica no localStorage, então a sacola é a mesma em todas as páginas
   Só depende dos nomes de classe já usados no site:
   .prato / .nomeprato / .precoprato / .fotoprato / .loja / .lojatitulo
   .header__cart (index) e .carrinho (demais páginas)
================================================================================ */

(function () {
  'use strict';

  const WHATS = '5531900000000';                       // DDI + DDD + número
  const TAXAS = {                                      // taxa de entrega por unidade
    'Sooshi Lourdes': 5.9,
    'Sooshi Savassi': 7.5,
    'Sooshi Castelo': 0
  };

  // Chaves compartilhadas com a página "Minha conta"
  const CH = {
    carrinho: 'sooshi-carrinho',
    detalhes: 'sooshi-sacola-itens',
    pedidos: 'sooshi-pedidos',
    usuarios: 'sooshi-usuarios',
    sessao: 'sooshi-sessao'
  };

  /* ---------- utilidades ---------- */

  const ler = (k, padrao) => {
    try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? padrao : v; }
    catch (e) { return padrao; }
  };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem storage */ } };
  const real = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const taxaDe = (loja) => TAXAS[loja] || 0;

  /* ---------- promoções ----------
     - 2 por 1: ativada pelo botão da home, some depois de usada num pedido
     - Terça do Temaki: 20% nos temakis, automático só na terça-feira
     - Frete grátis: automático quando o pedido (já com descontos) passa do mínimo   */
  const PROMO = 'sooshi-promo';                        // 'ativa' | 'usada'
  const FRETE_GRATIS_A_PARTIR = 80;                    // em reais
  const DIA_TERCA = 2;                                 // 0 = domingo ... 2 = terça
  const DESCONTO_TERCA = 0.2;                          // 20%

  const promoStatus = () => { try { return localStorage.getItem(PROMO); } catch (e) { return null; } };
  const ehTerca = () => new Date().getDay() === DIA_TERCA;
  // "Temaki a dois" e o Combo casal já são combos, então ficam fora das promoções de temaki
  const ehTemaki = (nome) => /^temaki/i.test(nome) && !/a dois/i.test(nome);

  // devolve { dois, terca }: quanto cada promoção abate no pedido
  function descontos(itens) {
    const dois = promoStatus() === 'ativa';
    const terca = ehTerca();
    if (!dois && !terca) return { dois: 0, terca: 0 };

    const porLoja = {};
    itens.forEach((i) => {
      if (!ehTemaki(i.nome)) return;
      const l = (porLoja[i.loja] = porLoja[i.loja] || []);
      for (let k = 0; k < i.qtd; k++) l.push(i.preco);
    });

    let gratis = 0;   // 2 por 1: a cada 2 temakis da mesma unidade, o mais barato do par sai de graça
    let resto = 0;    // o que sobra dos temakis é base da Terça do Temaki
    Object.keys(porLoja).forEach((loja) => {
      porLoja[loja].sort((x, y) => y - x).forEach((preco, k) => {
        if (dois && k % 2 === 1) gratis += preco;
        else resto += preco;
      });
    });

    return {
      dois: gratis,
      terca: terca ? Math.round(resto * DESCONTO_TERCA * 100) / 100 : 0
    };
  }

  /* ---------- estado (sempre lido do storage) ---------- */

  function estado() {
    const c = ler(CH.carrinho, {});
    return {
      cidade: c.cidade || 'Belo Horizonte',
      carrinho: c.carrinho || {},
      det: ler(CH.detalhes, {})
    };
  }

  function listar(s) {
    return Object.keys(s.carrinho)
      .filter((id) => s.det[id] && s.carrinho[id] > 0)
      .map((id) => Object.assign({ id, qtd: s.carrinho[id] }, s.det[id]));
  }

  function totais(itens) {
    const sub = itens.reduce((t, i) => t + i.preco * i.qtd, 0);
    const lojas = [...new Set(itens.map((i) => i.loja))];
    const taxaCheia = lojas.reduce((t, l) => t + taxaDe(l), 0);
    const d = descontos(itens);
    const desc = d.dois + d.terca;
    const freteGratis = itens.length > 0 && sub - desc >= FRETE_GRATIS_A_PARTIR;
    const taxa = freteGratis ? 0 : taxaCheia;
    return {
      sub, taxa, taxaCheia, freteGratis,
      descDois: d.dois, descTerca: d.terca, desc,
      total: sub + taxa - desc
    };
  }

  function salvar(s) {
    const itens = listar(s);
    gravar(CH.detalhes, s.det);
    gravar(CH.carrinho, {
      cidade: s.cidade,
      carrinho: s.carrinho,
      resumo: {
        total: totais(itens).total,
        itens: itens.map((i) => ({ nome: i.nome, loja: i.loja, qtd: i.qtd, preco: i.preco }))
      }
    });
  }

  /* ---------- ler os dados do card clicado ---------- */

  function lerCard(card) {
    const nome = (card.querySelector('.nomeprato') || {}).textContent;
    const precoTxt = (card.querySelector('.precoprato') || {}).textContent;
    if (!nome || !precoTxt) return null;

    const preco = parseFloat(precoTxt.replace(/[^\d,]/g, '').replace(',', '.'));
    if (isNaN(preco)) return null;

    const lojaEl = card.closest('.loja') && card.closest('.loja').querySelector('.lojatitulo');
    const loja = lojaEl ? lojaEl.textContent.trim().replace(/\s+/g, ' ') : 'Sooshi';
    const img = card.querySelector('.fotoprato');
    const limpo = nome.trim().replace(/\s+/g, ' ');

    return {
      id: loja + '|' + limpo + '|' + preco.toFixed(2),   // preço no id: pratos de mesmo nome não se misturam
      nome: limpo,
      loja,
      preco,
      img: img ? img.getAttribute('src') : ''
    };
  }

  function clienteLogado() {
    try {
      const mail = JSON.parse(localStorage.getItem(CH.sessao));
      return (JSON.parse(localStorage.getItem(CH.usuarios)) || {})[mail] || null;
    } catch (e) { return null; }
  }

  function enderecoEntrega(u) {
    const a = u && u.enderecos && (u.enderecos.find((x) => x.principal) || u.enderecos[0]);
    return a ? `${a.rua}, ${a.numero}${a.comp ? ' (' + a.comp + ')' : ''} - ${a.bairro}` : '';
  }

  /* ---------- montar a gaveta ---------- */

  let el = {};
  let focoAnterior = null;
  let tempoAviso;

  function montar() {
    const html = `
      <div class="sacola-fundo" id="sacolaFundo"></div>
      <aside class="sacola" id="sacola" role="dialog" aria-modal="true" aria-label="Sua sacola" aria-hidden="true">
        <header class="sacola-cab">
          <button type="button" class="sacola-fechar" id="sacolaFechar" aria-label="Fechar sacola">
            <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <h2>Sua sacola</h2>
          <button type="button" class="sacola-limpar" id="sacolaLimpar" hidden>Limpar</button>
        </header>
        <div class="sacola-corpo" id="sacolaCorpo"></div>
        <footer class="sacola-rodape" id="sacolaRodape" hidden>
          <div class="sacola-linha"><span>Subtotal</span><span id="sacolaSub"></span></div>
          <div class="sacola-linha"><span>Entrega</span><span id="sacolaTaxa"></span></div>
          <div class="sacola-linha promo" id="sacolaDescLinha" hidden><span>Promoção 2 por 1</span><span id="sacolaDesc"></span></div>
          <div class="sacola-linha promo" id="sacolaTercaLinha" hidden><span>Terça do Temaki (20%)</span><span id="sacolaTerca"></span></div>
          <div class="sacola-dica" id="sacolaDica" hidden></div>
          <div class="sacola-linha total"><span>Total</span><span id="sacolaTotal"></span></div>
          <a class="sacola-final" id="sacolaFinal" href="#" target="_blank" rel="noopener">Finalizar pedido</a>
        </footer>
      </aside>
      <div class="sacola-aviso" id="sacolaAviso" role="status"></div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    ['Fundo', 'Fechar', 'Limpar', 'Corpo', 'Rodape', 'Sub', 'Taxa', 'Total', 'Final', 'Aviso', 'DescLinha', 'Desc', 'TercaLinha', 'Terca', 'Dica']
      .forEach((n) => { el[n] = document.getElementById('sacola' + n); });
    el.gaveta = document.getElementById('sacola');
  }

  function prepararBotoes() {
    document.querySelectorAll('.header__cart, .carrinho').forEach((btn) => {
      // reaproveita o contador que a página já tem (Conta.html) ou cria um
      if (!btn.querySelector('.contador, .sacola-badge')) {
        btn.insertAdjacentHTML('beforeend', '<b class="sacola-badge"></b>');
      }
      btn.addEventListener('click', (e) => { e.preventDefault(); abrir(); });
    });
  }

  function atualizarContador(n, animar) {
    document.querySelectorAll('.sacola-badge, .contador').forEach((b) => {
      b.textContent = n || '';
      if (animar) {
        b.classList.remove('pulo');
        void b.offsetWidth;
        b.classList.add('pulo');
      }
    });
  }

  /* ---------- desenhar ---------- */

  const ICONE_VAZIO = '<svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>';

  function desenhar(animar) {
    const s = estado();
    const itens = listar(s);
    const qtdTotal = itens.reduce((t, i) => t + i.qtd, 0);
    atualizarContador(qtdTotal, animar);

    el.Limpar.hidden = !itens.length;
    el.Rodape.hidden = !itens.length;

    if (!itens.length) {
      el.Corpo.innerHTML = `
        <div class="sacola-vazio">${ICONE_VAZIO}
          <b>Sua sacola está vazia</b>
          Clique em um prato do cardápio para adicioná-lo ao pedido.
        </div>`;
      el.Final.href = '#';
      return;
    }

    const t = totais(itens);

    // agrupa por unidade, mantendo a ordem em que foram adicionados
    const grupos = {};
    itens.forEach((i) => { (grupos[i.loja] = grupos[i.loja] || []).push(i); });

    el.Corpo.innerHTML = Object.keys(grupos).map((loja) => {
      const taxa = taxaDe(loja);
      return `
        <div class="sacola-loja">${esc(loja)}<small>${taxa && !t.freteGratis ? 'Entrega ' + real(taxa) : 'Entrega grátis'}</small></div>
        ${grupos[loja].map((i) => `
          <div class="sacola-item">
            ${i.img ? `<img src="${esc(i.img)}" alt="" />` : '<span class="sem-foto"></span>'}
            <div>
              <h4>${esc(i.nome)}</h4>
              <span class="un">${real(i.preco)} cada</span>
              <div class="sacola-qtd">
                <button type="button" data-qtd="-1" data-id="${esc(i.id)}" aria-label="Diminuir ${esc(i.nome)}">−</button>
                <span>${i.qtd}</span>
                <button type="button" data-qtd="1" data-id="${esc(i.id)}" aria-label="Aumentar ${esc(i.nome)}">+</button>
              </div>
            </div>
            <strong>${real(i.preco * i.qtd)}</strong>
          </div>`).join('')}`;
    }).join('');

    el.Sub.textContent = real(t.sub);
    el.Taxa.textContent = t.taxa ? real(t.taxa) : 'Grátis';
    el.DescLinha.hidden = promoStatus() !== 'ativa';
    el.Desc.textContent = t.descDois ? '− ' + real(t.descDois) : 'leve 2 temakis';
    el.TercaLinha.hidden = !ehTerca();
    el.Terca.textContent = t.descTerca ? '− ' + real(t.descTerca) : 'em temakis';

    // dica de frete grátis (só quando ainda há frete a abater)
    const falta = FRETE_GRATIS_A_PARTIR - (t.sub - t.desc);
    el.Dica.hidden = !(t.taxaCheia > 0 && falta > 0);
    if (!el.Dica.hidden) el.Dica.textContent = 'Faltam ' + real(falta) + ' para ganhar frete grátis';
    el.Total.textContent = real(t.total);

    // mensagem do WhatsApp
    const cli = clienteLogado();
    const end = enderecoEntrega(cli);
    const msg = `Olá, Sooshi! Quero fazer um pedido (${s.cidade}):\n`
      + itens.map((i) => `${i.qtd}x ${i.nome} (${i.loja})`).join('\n')
      + (t.descDois ? `\nPromoção 2 por 1: -${real(t.descDois)}` : '')
      + (t.descTerca ? `\nTerça do Temaki (20%): -${real(t.descTerca)}` : '')
      + (t.freteGratis && t.taxaCheia ? '\nFrete grátis' : '')
      + `\nTotal: ${real(t.total)}`
      + (cli ? `\nCliente: ${cli.nome}` : '')
      + (end ? `\nEntregar em: ${end}` : '');
    el.Final.href = `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
  }

  /* ---------- ações ---------- */

  function adicionar(dados) {
    const s = estado();
    s.det[dados.id] = { nome: dados.nome, loja: dados.loja, preco: dados.preco, img: dados.img };
    s.carrinho[dados.id] = (s.carrinho[dados.id] || 0) + 1;
    salvar(s);
    desenhar(true);
    avisar(`${dados.nome} adicionado à sacola`);
  }

  function mudarQtd(id, delta) {
    const s = estado();
    if (!s.carrinho[id]) return;
    s.carrinho[id] += delta;
    if (s.carrinho[id] <= 0) delete s.carrinho[id];
    salvar(s);
    desenhar(false);
  }

  function limpar() {
    const s = estado();
    s.carrinho = {};
    salvar(s);
    desenhar(false);
  }

  function finalizar() {
    const s = estado();
    const itens = listar(s);
    if (!itens.length) return;
    const cli = clienteLogado();
    const pedidos = ler(CH.pedidos, []);
    pedidos.unshift({
      id: Date.now(),
      data: new Date().toISOString(),
      cidade: s.cidade,
      email: cli ? cli.email : '',
      itens: itens.map((i) => ({ id: i.id, nome: i.nome, loja: i.loja, qtd: i.qtd, preco: i.preco, img: i.img })),
      total: totais(itens).total
    });
    gravar(CH.pedidos, pedidos);

    // gastou a promoção 2 por 1: ela some da home
    if (totais(itens).descDois > 0) {
      try { localStorage.setItem(PROMO, 'usada'); } catch (e) { /* sem storage */ }
      window.dispatchEvent(new Event('sooshi-promo-usada'));   // o carrossel da home tira o slide
    }

    // o link do WhatsApp já foi lido pelo navegador; agora esvazia a sacola
    s.carrinho = {};
    salvar(s);
    setTimeout(() => { desenhar(false); fechar(); avisar('Pedido enviado! Veja em Minha conta'); }, 0);
  }

  function avisar(texto) {
    el.Aviso.textContent = texto;
    el.Aviso.classList.add('on');
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(() => el.Aviso.classList.remove('on'), 1800);
  }

  function abrir() {
    desenhar(false);                     // relê o storage (ex.: veio da página Conta)
    focoAnterior = document.activeElement;
    document.body.classList.add('sacola-aberta');
    el.gaveta.setAttribute('aria-hidden', 'false');
    el.Fechar.focus();
  }

  function fechar() {
    document.body.classList.remove('sacola-aberta');
    el.gaveta.setAttribute('aria-hidden', 'true');
    if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
  }

  /* ---------- eventos ---------- */

  function iniciar() {
    montar();
    window.sooshiSacola = { abrir, fechar, adicionar };
    prepararBotoes();
    desenhar(false);

    // clicar em qualquer prato = adicionar
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.prato');
      if (!card) return;
      e.preventDefault();
      const dados = lerCard(card);
      if (dados) adicionar(dados);
    });

    el.Corpo.addEventListener('click', (e) => {
      const b = e.target.closest('[data-qtd]');
      if (b) mudarQtd(b.dataset.id, Number(b.dataset.qtd));
    });

    el.Fechar.addEventListener('click', fechar);
    el.Fundo.addEventListener('click', fechar);
    el.Limpar.addEventListener('click', limpar);
    el.Final.addEventListener('click', (e) => {
      if (el.Final.getAttribute('href') === '#') { e.preventDefault(); return; }
      finalizar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('sacola-aberta')) fechar();
    });

    // outra aba mexeu na sacola
    window.addEventListener('storage', (e) => {
      if (e.key === CH.carrinho || e.key === CH.detalhes) desenhar(false);
    });

    // voltar pelo histórico (bfcache) mantém o contador certo
    window.addEventListener('pageshow', () => desenhar(false));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
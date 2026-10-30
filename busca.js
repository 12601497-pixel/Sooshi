/* ================= BUSCA · acha qualquer prato do site =================
   Funciona no campo "Buscar" do topo (.header__search / .busca).
   Mostra os resultados num painel; clicar no resultado adiciona à sacola.
   Para incluir um prato novo, é só acrescentar no CATALOGO abaixo
   (mesmo nome, preço e imagem que está no HTML da página).
======================================================================== */
(function () {
  'use strict';

  const CATALOGO_POR_LOJA = {
    Combinados: {
      'Sooshi Lourdes': [
        ['Combinado 26 peças', 54.89, 'C (3).png'],
        ['Combinado 24 peças', 40.29, 'C (1).png'],
        ['Combinado 26 peças', 44.89, 'C (2).png']
      ],
      'Sooshi Savassi': [
        ['Combinado Individual (10 a 15 peças)', 25.25, 'https://static.tapper.com.br/gallery/tenants/dff6e2e4-05d1-4974-b758-45d76fc956b2/9e77c2ce-312f-4c11-a9a2-d8219c9c7e62.jpg'],
        ['Combinado para Casal (20 a 32 peças)', 29.65, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsUbtkdi3wYALh-DFjA0BDm2pl4gFacpdC6l3Fo8VrBbr3-NSbOGVro80&s=10'],
        ['Barca de Sushi (60 a mais peças)', 140.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRddzdKJ98orDNPRAzm_I7itGHQ3sWPVZoYodZ8AcaNSPsKQ2rOftjyoXA&s=10']
      ],
      'Sooshi Castelo': [
        ['Combos de Hot Roll', 42.89, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS79Xa5BR0WDm6JbGnQ2ksAscNh0W_rWMPaSUSonJKHPINiuzrA4xQ8I9Q&s=10'],
        ['Combos de Sashimi', 88.34, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyvcSABC4KVsIVD4wdfTRv0QGrP4WI6H1sbfcBl2UK3iH46sP9mulPYkk&s=10'],
        ['Combos de Wagyu', 60.19, 'https://thumbs.dreamstime.com/b/grupo-de-rolo-sushi-grelhado-da-carne-wagyu-no-plateef-preto-110503853.jpg']
      ]
    },

    Temakis: {
      'Sooshi Lourdes': [
        ['Temaki a dois', 21.90, 'temaki (1).png'],
        ['Temaki Grelhado', 18.59, 'https://djapa.com.br/blog/comida-japonesa/temaki-conheca-alguns-sabores-desta-iguaria-japonesa/attachment/temaki-salmao-grelhado/'],
        ['Temaki Hot', 25.80, 'https://sushimusic.correka.com.br/_core/_uploads/144/2025/11/15530411252dkfjbh3ki.jpg']
      ],
      'Sooshi Savassi': [
        ['Temaki de Wagyu', 70.99, 'https://media-cdn.tripadvisor.com/media/photo-s/1d/3e/b4/1e/a5-japanese-wagyu-temaki.jpg'],
        ['Temaki de Peixe Branco', 17.52, 'https://i.pinimg.com/736x/0e/b1/92/0eb19247829d9645a038c71dc53b4a6d.jpg'],
        ['Temaki de Polvo', 38.00, 'https://cdn.vucasolution.com.br/upload/w_800/https://gryyplgyeyqb.compat.objectstorage.sa-saopaulo-1.oraclecloud.com/vuca-cdn/wasabi/arqs/produtos/n6os5qgpwkcfzse20zuw.jpg']
      ],
      'Sooshi Castelo': [
        ['Temaki Vegano', 15.40, 'https://djapa.com.br/wp-content/uploads/2022/11/temaki-shimeji.jpg'],
        ['Temaki Filadélfia', 27.90, 'https://static-images.ifood.com.br/pratos/edeaa7ca-b619-475a-a091-7840875b5843/202301311422_L5TO_i.jpg'],
        ['Temaki de Camarão', 42.90, 'https://static-images.ifood.com.br/pratos/edeaa7ca-b619-475a-a091-7840875b5843/202301311421_TAUW_i.jpg']
      ]
    },

    Yakisoba: {
      'Sooshi Lourdes': [
        ['Yakisoba Premium', 54.89, 'Yakisoba (2).png'],
        ['Yakisoba Xadrez', 40.29, 'Yakisoba (1).png'],
        ['Wok & Alma G', 44.89, 'Yakisoba (3).png']
      ],
      'Sooshi Savassi': [
        ['Yakisoba Misto', 34.60, 'https://guiadacozinha.com.br/wp-content/uploads/2019/11/yakisoba-de-frango-1.jpg'],
        ['Yakisoba de Carne', 38.60, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBVD9inSJGSEkHds43B0VP1kwLYWW2ES7Z_383CxNA6Xk5sH4xdz6x87I&s=10'],
        ['Yakisoba de Frutos do Mar', 62.90, 'https://alloydeliveryimages.ligafiles.com.br/item_images/2781/66a14b7fd5446t7vxp.webp']
      ],
      'Sooshi Castelo': [
        ['Yakisoba Vegano com Tofu', 34.60, 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSXIdCzAhkeVfCP1SOFMBe1FnpJLITF7UFm3jTY441fuVVp0YOo'],
        ['Yakisoba Premium com Bacon', 40.29, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSumwzMNqIHIeSXH3IKp6EUSRFfiAHIoQwiu0YFO_du5n10aDbS'],
        ['Yakisoba Fit com Macarrão de Shiritaki', 52.10, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl3T53kdJat0d4sywqpPe3d_HhD8GHzqh4ISN-AZIdy7UVXc5dOkHgmscf&s=10']
      ]
    },

    Poke: {
      'Sooshi Lourdes': [
        ['Poke Premium', 44.89, 'Poki (2).png'],
        ['Poke Rba', 40.29, 'Poki (3).png'],
        ['Poke Bola', 56.99, 'Poki (1).png']
      ],
      'Sooshi Savassi': [
        ['Poke de Camarão', 49.70, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTujaP2P6CeW7JjkEbyjlZ1Au7kJGiqAWW6W048ZpeaG8z1LQHuBmlgYBw&s=10'],
        ['Poke de Atum', 40.29, 'https://totalpass.com/wp-content/uploads/2024/01/poke-de-atum.png'],
        ['Poke Vegano', 30.00, 'https://conteudo.imguol.com.br/blogs/213/files/2019/06/poke-vegetariano-menor-1024x683.jpg']
      ],
      'Sooshi Castelo': [
        ['Poke Low Carb', 58.00, 'https://stemandspoon.com/wp-content/uploads/2020/09/keto-poke-bowl-recipe-featured.jpg'],
        ['Poke Hot', 48.30, 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR7hIqqs56jcjqBVvk4-y-bTEWp8LAKuBoPtVwlQhhIXUjOuDIO'],
        ['Poke Doce', 27.00, 'https://i.pinimg.com/236x/08/aa/2a/08aa2a272eb494e2a374fec0eb174959.jpg']
      ]
    }
  };

  const CATALOGO = [];
  const add = (cat, loja, nome, preco, img) => CATALOGO.push({ cat, loja, nome, preco, img });

  Object.keys(CATALOGO_POR_LOJA).forEach((cat) =>
    Object.keys(CATALOGO_POR_LOJA[cat]).forEach((loja) =>
      CATALOGO_POR_LOJA[cat][loja].forEach(([n, p, i]) => add(cat, loja, n, p, i))));

  /* Queridinhos da home (sem loja específica) */
  add('Poke', 'Sooshi', 'Poke Salmão e Edamame', 59.52, 'S3.png');
  add('Temakis', 'Sooshi', 'Temaki Salcheese', 39.90, 'S1.png');

  /* ---------- utilidades ---------- */
  const sem = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const real = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  CATALOGO.forEach((i) => {
    i.id = i.loja + '|' + i.nome + '|' + i.preco.toFixed(2);
    i.alvo = sem([i.nome, i.loja, i.cat].join(' '));
  });

  function buscar(q) {
    const t = sem(q).split(/\s+/).filter(Boolean).map((x) => x.replace(/s$/, ''));
    if (!t.length) return null;
    return CATALOGO.filter((i) => t.every((x) => i.alvo.includes(x)));
  }

  /* ---------- painel ---------- */
  const css = `
    .busca-wrap{position:relative}
    .busca-painel{display:none;position:absolute;top:calc(100% + 8px);left:0;z-index:9998;width:380px;max-width:92vw;max-height:60vh;overflow-y:auto;padding:6px;background:#1a1a1a;border:1px solid #333;border-radius:10px;box-shadow:0 14px 34px rgba(0,0,0,.55)}
    .busca-painel.on{display:block}
    .busca-item{display:grid;grid-template-columns:48px 1fr auto;gap:10px;align-items:center;width:100%;padding:8px;color:#fff;font-family:"Inter",Arial,sans-serif;text-align:left;background:none;border:0;border-radius:8px;cursor:pointer;transition:background .2s}
    .busca-item:hover,.busca-item:focus-visible{background:#262626;outline:none}
    .busca-item img{width:48px;height:48px;object-fit:cover;background:#262626;border-radius:8px}
    .busca-item b{display:block;font-size:13px;line-height:1.3}
    .busca-item small{display:block;margin-top:2px;font-size:11px;color:#9a9a9a}
    .busca-item .pr{font-size:13px;font-weight:700;white-space:nowrap}
    .busca-item .mais{display:inline-grid;place-items:center;width:22px;height:22px;margin-left:8px;font-size:15px;color:#fff;background:#cf510d;border-radius:50%}
    .busca-vazio{padding:18px 12px;font:13px/1.5 "Inter",Arial,sans-serif;text-align:center;color:#9a9a9a}
  `;

  function iniciar() {
    const campo = document.querySelector('.header__search input, .busca input');
    if (!campo) return;
    const caixa = campo.closest('.header__search, .busca');

    const estilo = document.createElement('style');
    estilo.textContent = css;
    document.head.appendChild(estilo);

    caixa.classList.add('busca-wrap');
    const painel = document.createElement('div');
    painel.className = 'busca-painel';
    painel.setAttribute('role', 'listbox');
    caixa.appendChild(painel);

    let atuais = [];

    const fechar = () => painel.classList.remove('on');

    function desenhar() {
      const achados = buscar(campo.value);
      if (achados === null) { fechar(); return; }
      atuais = achados;
      painel.innerHTML = achados.length
        ? achados.map((i, n) => `
            <button type="button" class="busca-item" role="option" data-i="${n}">
              <img src="${esc(i.img)}" alt="" />
              <span><b>${esc(i.nome)}</b><small>${esc(i.loja)} · ${esc(i.cat)}</small></span>
              <span class="pr">${real(i.preco)}<span class="mais">+</span></span>
            </button>`).join('')
        : '<div class="busca-vazio">Nenhum prato encontrado.<br>Tente “temaki”, “poke” ou “combinado”.</div>';
      painel.classList.add('on');
    }

    campo.addEventListener('input', desenhar);
    campo.addEventListener('focus', () => { if (campo.value.trim()) desenhar(); });
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') e.preventDefault();
      if (e.key === 'Escape') fechar();
    });

    painel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (!b) return;
      const i = atuais[Number(b.dataset.i)];
      if (i && window.sooshiSacola && window.sooshiSacola.adicionar) {
        window.sooshiSacola.adicionar({ id: i.id, nome: i.nome, loja: i.loja, preco: i.preco, img: i.img });
      }
    });

    document.addEventListener('click', (e) => { if (!caixa.contains(e.target)) fechar(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();

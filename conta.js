/* ================= ARMAZENAMENTO ================= */
/* Demonstração no navegador (localStorage). Em um site de verdade,
   cadastro, login e pedidos precisam de um servidor e de um banco de dados. */

const CH = {
  usuarios: 'sooshi-usuarios',
  sessao: 'sooshi-sessao',
  pedidos: 'sooshi-pedidos',
  carrinho: 'sooshi-carrinho',
  sacola: 'sooshi-sacola-itens'
};

const ler = (k, padrao) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v === null || v === undefined ? padrao : v;
  } catch (e) { return padrao; }
};
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem storage */ } };

// Hash simples só para não guardar a senha em texto puro na demonstração
const hash = (s) => {
  let h = 5381;
  for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return h.toString(36);
};

const $ = (id) => document.getElementById(id);
const real = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

let email = ler(CH.sessao, null);
let avisoTempo;

const usuarios = () => ler(CH.usuarios, {});
const usuario = () => usuarios()[email] || null;

function salvarUsuario(u) {
  const todos = usuarios();
  todos[u.email] = u;
  gravar(CH.usuarios, todos);
}

function avisar(texto) {
  const el = $('aviso');
  el.textContent = texto;
  el.classList.add('on');
  clearTimeout(avisoTempo);
  avisoTempo = setTimeout(() => el.classList.remove('on'), 2000);
}

/* ================= VALIDAÇÃO ================= */

function erro(input, msg) {
  const campo = input.closest('.campo');
  campo.classList.toggle('invalido', !!msg);
  campo.querySelector('.erro').textContent = msg || '';
  return !msg;
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const soDigitos = (v) => v.replace(/\D/g, '');

function mascaraTel(v) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function mascaraCep(v) {
  const d = soDigitos(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/* ================= TELAS ================= */

function mostrarTela() {
  const logado = !!usuario();
  if (!logado) email = null;
  $('telaAuth').hidden = logado;
  $('telaPainel').hidden = !logado;
  if (window.sooshiSessao) window.sooshiSessao.atualizar();
  if (logado) {
    desenharPerfil();
    preencherDados();
    desenharEnderecos();
    desenharPedidos();
    desenharResumo();
    abrirPainel((location.hash || '').replace('#', '') || 'resumo');
  }
}

function abrirAba(aba) {
  document.querySelectorAll('.abas [data-aba]').forEach((b) =>
    b.setAttribute('aria-selected', String(b.dataset.aba === aba)));
  $('formEntrar').hidden = aba !== 'entrar';
  $('formCriar').hidden = aba !== 'criar';
}

function abrirPainel(nome) {
  const PAINEIS = ['resumo', 'dados', 'enderecos', 'pedidos'];
  if (!PAINEIS.includes(nome)) nome = 'resumo';
  PAINEIS.forEach((n) => { $('painel-' + n).hidden = n !== nome; });
  document.querySelectorAll('#menuLat [data-painel]').forEach((b) =>
    b.setAttribute('aria-current', String(b.dataset.painel === nome)));
}

function desenharPerfil() {
  const u = usuario();
  $('perfilNome').textContent = u.nome.split(' ')[0];
  $('perfilEmail').textContent = u.email;
  $('avatar').textContent = u.nome.trim().charAt(0).toUpperCase();
  $('olaTitulo').textContent = `Olá, ${u.nome.split(' ')[0]}!`;
}

/* ================= CADASTRO E LOGIN ================= */

function criarConta(e) {
  e.preventDefault();
  const nome = $('cNome'), mail = $('cEmail'), tel = $('cTel'), s1 = $('cSenha'), s2 = $('cSenha2');
  const e1 = erro(nome, nome.value.trim().split(/\s+/).length < 2 ? 'Digite nome e sobrenome.' : '');
  const e2 = erro(mail, !emailOk(mail.value.trim()) ? 'Digite um e-mail válido.' : '');
  const e3 = erro(tel, soDigitos(tel.value).length < 10 ? 'Digite o DDD e o número.' : '');
  const e4 = erro(s1, s1.value.length < 6 ? 'Use pelo menos 6 caracteres.' : '');
  const e5 = erro(s2, s2.value !== s1.value ? 'As senhas não são iguais.' : '');
  if (!(e1 && e2 && e3 && e4 && e5)) return;

  const chave = mail.value.trim().toLowerCase();
  if (usuarios()[chave]) {
    erro(mail, 'Já existe uma conta com este e-mail.');
    return;
  }

  salvarUsuario({
    nome: nome.value.trim(), email: chave, tel: tel.value,
    senha: hash(s1.value), enderecos: []
  });
  email = chave;
  gravar(CH.sessao, email);
  e.target.reset();
  mostrarTela();
  avisar('Conta criada. Bem-vindo à Sooshi!');
}

function entrar(e) {
  e.preventDefault();
  const mail = $('eEmail'), senha = $('eSenha');
  const ok1 = erro(mail, !emailOk(mail.value.trim()) ? 'Digite um e-mail válido.' : '');
  const ok2 = erro(senha, !senha.value ? 'Digite a senha.' : '');
  if (!(ok1 && ok2)) return;

  const u = usuarios()[mail.value.trim().toLowerCase()];
  if (!u || u.senha !== hash(senha.value)) {
    erro(senha, 'E-mail ou senha incorretos.');
    return;
  }
  email = u.email;
  gravar(CH.sessao, email);
  e.target.reset();
  mostrarTela();
  avisar(`Olá, ${u.nome.split(' ')[0]}!`);
}

function sair() {
  email = null;
  try { localStorage.removeItem(CH.sessao); } catch (e) { /* ignora */ }
  mostrarTela();
  abrirAba('entrar');
  avisar('Você saiu da conta.');
}

/* ================= MEUS DADOS ================= */

function preencherDados() {
  const u = usuario();
  $('dNome').value = u.nome;
  $('dEmail').value = u.email;
  $('dTel').value = u.tel;
}

function salvarDados(e) {
  e.preventDefault();
  const nome = $('dNome'), tel = $('dTel');
  const ok1 = erro(nome, nome.value.trim().split(/\s+/).length < 2 ? 'Digite nome e sobrenome.' : '');
  const ok2 = erro(tel, soDigitos(tel.value).length < 10 ? 'Digite o DDD e o número.' : '');
  if (!(ok1 && ok2)) return;

  const u = usuario();
  u.nome = nome.value.trim();
  u.tel = tel.value;
  salvarUsuario(u);
  desenharPerfil();
  avisar('Dados atualizados.');
}

/* ================= ENDEREÇOS ================= */

function desenharEnderecos() {
  const lista = usuario().enderecos;
  $('listaEnd').innerHTML = lista.length ? lista.map((a) => `
      <div class="item">
        <div class="itemcab">
          <strong>${esc(a.apelido)}</strong>
          ${a.principal ? '<span class="selo">Principal</span>' : ''}
        </div>
        <p>${esc(a.rua)}, ${esc(a.numero)}${a.comp ? ' · ' + esc(a.comp) : ''}<br>
           ${esc(a.bairro)}${a.cep ? ' · CEP ' + esc(a.cep) : ''}</p>
        <div class="itemacoes">
          ${a.principal ? '' : `<button type="button" class="link" data-principal="${a.id}">Tornar principal</button>`}
          <button type="button" class="link perigo" data-excluir="${a.id}">Excluir</button>
        </div>
      </div>`).join('')
    : '<div class="vazio"><b>Nenhum endereço salvo</b>Cadastre um endereço para agilizar seus pedidos.</div>';
}

// Evita que texto digitado vire HTML
function esc(t) {
  return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formEnd(abrir) {
  $('formEnd').hidden = !abrir;
  if (abrir) $('nApelido').focus();
  else {
    $('formEnd').reset();
    $('formEnd').querySelectorAll('.campo').forEach((c) => {
      c.classList.remove('invalido');
      c.querySelector('.erro').textContent = '';
    });
  }
}

function salvarEndereco(e) {
  e.preventDefault();
  const ap = $('nApelido'), cep = $('nCep'), rua = $('nRua'), num = $('nNum'), bairro = $('nBairro');
  const ok = [
    erro(ap, !ap.value.trim() ? 'Dê um nome ao endereço.' : ''),
    erro(cep, cep.value && soDigitos(cep.value).length !== 8 ? 'CEP com 8 números.' : ''),
    erro(rua, !rua.value.trim() ? 'Informe a rua.' : ''),
    erro(num, !num.value.trim() ? 'Informe o número.' : ''),
    erro(bairro, !bairro.value.trim() ? 'Informe o bairro.' : '')
  ].every(Boolean);
  if (!ok) return;

  const u = usuario();
  u.enderecos.push({
    id: Date.now(), apelido: ap.value.trim(), cep: cep.value, rua: rua.value.trim(),
    numero: num.value.trim(), bairro: bairro.value.trim(), comp: $('nComp').value.trim(),
    principal: u.enderecos.length === 0
  });
  salvarUsuario(u);
  formEnd(false);
  desenharEnderecos();
  avisar('Endereço salvo.');
}

function listaEndClick(e) {
  const u = usuario();
  const p = e.target.closest('[data-principal]');
  const x = e.target.closest('[data-excluir]');
  if (p) {
    u.enderecos.forEach((a) => { a.principal = String(a.id) === p.dataset.principal; });
  } else if (x) {
    u.enderecos = u.enderecos.filter((a) => String(a.id) !== x.dataset.excluir);
    if (u.enderecos.length && !u.enderecos.some((a) => a.principal)) u.enderecos[0].principal = true;
  } else return;
  salvarUsuario(u);
  desenharEnderecos();
}

// Preenche rua e bairro pelo CEP (ViaCEP). Se a consulta falhar, o cliente digita.
async function buscarCep() {
  const d = soDigitos($('nCep').value);
  if (d.length !== 8) return;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    const j = await r.json();
    if (j.erro) return erro($('nCep'), 'CEP não encontrado.');
    erro($('nCep'), '');
    if (!$('nRua').value) $('nRua').value = j.logradouro || '';
    if (!$('nBairro').value) $('nBairro').value = j.bairro || '';
    $('nNum').focus();
  } catch (err) { /* sem internet: segue manual */ }
}

/* ================= PEDIDOS ================= */

function cardPedido(p) {
  const data = new Date(p.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  return `
      <div class="item">
        <div class="itemcab">
          <strong>Pedido #${String(p.id).slice(-5)}</strong>
          <span class="selo">Enviado pelo WhatsApp</span>
        </div>
        <p>${data} · ${esc(p.cidade)}<br>
           ${p.itens.map((i) => `${i.qtd}x ${esc(i.nome)} (${esc(i.loja)})`).join('<br>')}</p>
        <div class="pedtotal">
          <strong>${real(p.total)}</strong>
          <button type="button" class="btn sec" data-repetir="${p.id}">Pedir novamente</button>
        </div>
      </div>`;
}

const meusPedidos = () => ler(CH.pedidos, []).filter((p) => !p.email || p.email === email);

function desenharPedidos() {
  const meus = meusPedidos();
  $('listaPed').innerHTML = meus.length ? meus.map(cardPedido).join('')
    : '<div class="vazio"><b>Você ainda não fez pedidos</b>Quando finalizar um pedido na <a href="index.html#cardapio">loja</a>, ele aparece aqui.</div>';
}

// Aba "Resumo": último pedido (a sacola fica no menu lateral, não aqui)
function desenharResumo() {
  const ultimo = meusPedidos()[0];
  $('resumoUltimo').innerHTML = ultimo ? cardPedido(ultimo)
    : '<div class="vazio"><b>Você ainda não fez pedidos</b>O último pedido finalizado aparece aqui.</div>';
}

function repetirPedido(e) {
  const b = e.target.closest('[data-repetir]');
  if (!b) return;
  const p = ler(CH.pedidos, []).find((x) => String(x.id) === b.dataset.repetir);
  if (!p) return;
  const carrinho = {};
  const det = ler(CH.sacola, {});
  p.itens.forEach((i) => {
    const id = i.id || (i.loja + '|' + i.nome);
    carrinho[id] = i.qtd;
    det[id] = { nome: i.nome, loja: i.loja, preco: i.preco, img: i.img || (det[id] && det[id].img) || '' };
  });
  gravar(CH.sacola, det);
  gravar(CH.carrinho, { cidade: p.cidade, carrinho });
  if (window.sooshiSacola) window.sooshiSacola.abrir();
}

/* ================= CABEÇALHO ================= */

function dropdownCidades() {
  const caixa = $('caixaCidade'), btn = $('btnCidade'), lista = $('listaCidade'), atual = $('cidadeAtual');
  const abrirFechar = (abrir) => {
    lista.classList.toggle('aberto', abrir);
    btn.classList.toggle('girar', abrir);
    btn.setAttribute('aria-expanded', String(abrir));
  };
  btn.addEventListener('click', () => abrirFechar(!lista.classList.contains('aberto')));
  lista.addEventListener('click', (e) => {
    const item = e.target.closest('li');
    if (!item) return;
    atual.textContent = item.textContent;
    abrirFechar(false);
  });
  document.addEventListener('click', (e) => { if (!caixa.contains(e.target)) abrirFechar(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') abrirFechar(false); });
}

/* ================= INÍCIO ================= */

document.addEventListener('DOMContentLoaded', () => {
  dropdownCidades();

  document.querySelectorAll('.abas [data-aba]').forEach((b) =>
    b.addEventListener('click', () => abrirAba(b.dataset.aba)));
  document.querySelectorAll('#menuLat [data-painel]').forEach((b) =>
    b.addEventListener('click', () => abrirPainel(b.dataset.painel)));

  $('formEntrar').addEventListener('submit', entrar);
  $('formCriar').addEventListener('submit', criarConta);
  $('formDados').addEventListener('submit', salvarDados);
  $('formEnd').addEventListener('submit', salvarEndereco);
  $('btnSair').addEventListener('click', sair);
  $('btnNovoEnd').addEventListener('click', () => formEnd(true));
  $('btnCancelarEnd').addEventListener('click', () => formEnd(false));
  $('listaEnd').addEventListener('click', listaEndClick);
  $('listaPed').addEventListener('click', repetirPedido);
  $('resumoUltimo').addEventListener('click', repetirPedido);

  $('cTel').addEventListener('input', (e) => { e.target.value = mascaraTel(e.target.value); });
  $('dTel').addEventListener('input', (e) => { e.target.value = mascaraTel(e.target.value); });
  $('nCep').addEventListener('input', (e) => { e.target.value = mascaraCep(e.target.value); });
  $('nCep').addEventListener('blur', buscarCep);

  window.addEventListener('hashchange', () => { if (usuario()) abrirPainel(location.hash.replace('#', '')); });

  mostrarTela();
});
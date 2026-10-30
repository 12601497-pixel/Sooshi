/* ================= SESSÃO · botão "Entrar" / "Minha conta" =================
   Sem login  -> o link do menu vira o botão "Entrar"
   Com login  -> o botão some e volta o link "Minha conta"
   Usa as mesmas chaves do conta.js (sooshi-sessao / sooshi-usuarios).
============================================================================ */
(function () {
  'use strict';

  function logado() {
    try {
      const mail = JSON.parse(localStorage.getItem('sooshi-sessao'));
      const todos = JSON.parse(localStorage.getItem('sooshi-usuarios')) || {};
      return !!todos[mail];
    } catch (e) { return false; }
  }

  function atualizar() {
    const ok = logado();
    document.querySelectorAll('.header__nav a, .menu a').forEach((a) => {
      const t = a.textContent.trim();
      if (!a.hasAttribute('data-conta') && t !== 'Minha conta' && t !== 'Entrar') return;
      a.setAttribute('data-conta', '');
      a.setAttribute('href', 'Conta.html');
      a.textContent = ok ? 'Minha conta' : 'Entrar';
      a.classList.toggle('entrar', !ok);
    });
  }

  // o conta.js chama isso depois de entrar, criar conta ou sair
  window.sooshiSessao = { atualizar, logado };

  const iniciar = () => {
    atualizar();
    window.addEventListener('storage', atualizar);
    window.addEventListener('pageshow', atualizar);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();

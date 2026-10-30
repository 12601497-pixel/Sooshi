document.addEventListener('DOMContentLoaded', () => {
  const caixa = document.getElementById('caixaCidade');
  const btn = document.getElementById('btnCidade');
  const lista = document.getElementById('listaCidade');
  const atual = document.getElementById('cidadeAtual');

  if (!caixa || !btn || !lista || !atual) return;

  const abrirFechar = (abrir) => {
    lista.classList.toggle('aberto', abrir);
    btn.classList.toggle('girar', abrir);
    btn.setAttribute('aria-expanded', String(abrir));
  };

  // Abre/fecha ao clicar no botão
  btn.addEventListener('click', () => {
    abrirFechar(!lista.classList.contains('aberto'));
  });

  // Escolhe a cidade
  lista.addEventListener('click', (e) => {
    const item = e.target.closest('li');
    if (!item) return;
    atual.textContent = item.textContent;
    abrirFechar(false);
  });

  // Fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (!caixa.contains(e.target)) abrirFechar(false);
  });

  // Fecha com Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') abrirFechar(false);
  });
});

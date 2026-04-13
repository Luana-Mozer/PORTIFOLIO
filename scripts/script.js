const botao = document.getElementById('botao-tema');
const body = document.body;
const menuBotoes = document.querySelectorAll('#menu .link[data-view]');
const paineis = document.querySelectorAll('.painel-conteudo');

// Persistência do tema
const temasalvo = localStorage.getItem('tema');
temaEscuro(temasalvo === 'escuro');

// Função para alternar entre tema claro e escuro
function temaEscuro(tipo) {
  if (tipo == true) {
    body.classList.add('escuro');
    botao.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    body.classList.remove('escuro');
    botao.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}

botao.addEventListener('click', () => {
  const isescuro = body.classList.toggle('escuro');
  temaEscuro(isescuro);
  localStorage.setItem('tema', isescuro ? 'escuro' : 'claro');
});

function exibirPainel(view) {
  paineis.forEach((painel) => {
    painel.classList.toggle('ativo', painel.dataset.view === view);
  });

  menuBotoes.forEach((botaoMenu) => {
    botaoMenu.classList.toggle('ativo', botaoMenu.dataset.view === view);
  });
}

menuBotoes.forEach((botaoMenu) => {
  botaoMenu.addEventListener('click', () => {
    exibirPainel(botaoMenu.dataset.view);
  });
});

exibirPainel('video');

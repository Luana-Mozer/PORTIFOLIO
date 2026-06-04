const botao = document.getElementById('botao-tema');
const body = document.body;
const menuBotoes = document.querySelectorAll('#menu .link[data-view]');
const paineis = document.querySelectorAll('.painel-conteudo');
const popupAcesso = document.getElementById('login-popup');
const formularioAcesso = document.getElementById('login-form');
const campoNomeVisitante = document.getElementById('nome-visitante');
const campoEmpresaVisitante = document.getElementById('empresa-visitante');
const mensagemLogin = document.getElementById('login-mensagem');
const botaoAcessarSite = document.getElementById('botao-acessar-site');
const toastNotificacao = document.getElementById('toast-notificacao');

const neonDataApiUrl = window.NEON_DATA_API_URL || 'https://ep-aged-band-ac33aasw.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1';
const neonAuthUrl = window.NEON_AUTH_URL || 'https://ep-aged-band-ac33aasw.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
const neonDataApiToken = window.NEON_DATA_API_TOKEN || '';
const backendApiUrl = window.PORTFOLIO_API_URL || '';

const isGithubPages = window.location.hostname.includes('github.io');
// Determina a URL correta do endpoint de visitas conforme o ambiente de execução.
const urlApiVisitas = (() => {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const rodandoLocalmente = window.location.protocol === 'file:' || isLocalhost;

  // Em ambiente local (file://, Live Server ou localhost), usa sempre o backend
  // que está rodando na sua máquina, ignorando a URL remota.
  if (rodandoLocalmente) {
    const mesmaOrigem = isLocalhost && window.location.port === '3000';
    return mesmaOrigem ? '/api/visitas' : 'http://localhost:3000/api/visitas';
  }

  if (neonDataApiUrl) {
    return `${neonDataApiUrl.replace(/\/$/, '')}/visitas_portfolio`;
  }

  if (backendApiUrl) {
    return `${backendApiUrl.replace(/\/$/, '')}/api/visitas`;
  }

  return '/api/visitas';
})();

function normalizarComparacao(texto) {
  return String(texto || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

async function obterTokenNeon() {
  if (neonDataApiToken) {
    return neonDataApiToken;
  }

  const sessaoAtual = await fetch(`${neonAuthUrl}/get-session`, {
    credentials: 'include'
  });
  const tokenAtual = sessaoAtual.headers.get('set-auth-jwt');

  if (tokenAtual) {
    return tokenAtual;
  }

  const credenciaisSalvas = JSON.parse(localStorage.getItem('neon_auth_visitante') || 'null');
  const credenciais = credenciaisSalvas || {
    email: `visitante-${crypto.randomUUID()}@portfolio.local`,
    password: crypto.randomUUID(),
    name: 'Visitante Portfolio'
  };

  const endpoint = credenciaisSalvas ? 'sign-in/email' : 'sign-up/email';
  const respostaAuth = await fetch(`${neonAuthUrl}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciais)
  });

  if (!respostaAuth.ok && credenciaisSalvas) {
    localStorage.removeItem('neon_auth_visitante');
    throw new Error('Não foi possível autenticar na Neon Auth');
  }

  if (!respostaAuth.ok) {
    throw new Error('Não foi possível criar sessão na Neon Auth');
  }

  localStorage.setItem('neon_auth_visitante', JSON.stringify(credenciais));

  const novaSessao = await fetch(`${neonAuthUrl}/get-session`, {
    credentials: 'include'
  });
  const novoToken = novaSessao.headers.get('set-auth-jwt');

  if (!novoToken) {
    throw new Error('A Neon Auth não retornou um token JWT');
  }

  return novoToken;
}

async function cabecalhosNeon() {
  const headers = {
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  headers.Authorization = `Bearer ${await obterTokenNeon()}`;

  return headers;
}

function formatarData(dataIso) {
  if (!dataIso) {
    return '';
  }

  const [ano, mes, dia] = String(dataIso).split('T')[0].split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : dataIso;
}

async function buscarVisitas() {
  if (!urlApiVisitas || urlApiVisitas === '/api/visitas') {
    throw new Error('API de visitas não configurada');
  }

  if (neonDataApiUrl) {
    const resposta = await fetch(`${urlApiVisitas}?select=id,nome,empresa,data_visita,ip,navegador,criado_em&order=criado_em.desc`, {
      headers: await cabecalhosNeon()
    });

    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}`);
    }

    const visitas = await resposta.json();
    return visitas.map((visita) => ({
      ...visita,
      data_visita: formatarData(visita.data_visita)
    }));
  }

  const resposta = await fetch(urlApiVisitas);
  if (!resposta.ok) {
    throw new Error(`Erro ${resposta.status}`);
  }

  return resposta.json();
}

async function registrarVisita(dadosAcesso) {
  if (!urlApiVisitas || urlApiVisitas === '/api/visitas') {
    throw new Error('API de visitas não configurada');
  }

  if (neonDataApiUrl) {
    const hoje = new Date().toISOString().slice(0, 10);
    const resposta = await fetch(urlApiVisitas, {
      method: 'POST',
      headers: await cabecalhosNeon(),
      body: JSON.stringify({
        nome: dadosAcesso.nome,
        empresa: dadosAcesso.empresa,
        data_visita: hoje,
        navegador: navigator.userAgent || null
      })
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.message || erro.erro || `Erro ${resposta.status}`);
    }

    return { ok: true };
  }

  const resposta = await fetch(urlApiVisitas, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosAcesso)
  });

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(resultado.erro || 'Não foi possível registrar sua visita');
  }

  return resultado;
}

async function existeAcessoAnterior(nome, empresa) {
  if (!urlApiVisitas) {
    return false;
  }

  try {
    const visitas = await buscarVisitas();
    const nomeNormalizado = normalizarComparacao(nome);
    const empresaNormalizada = normalizarComparacao(empresa);

    return visitas.some((visita) =>
      normalizarComparacao(visita.nome) === nomeNormalizado
      && normalizarComparacao(visita.empresa) === empresaNormalizada
    );
  } catch (erro) {
    return false;
  }
}

function mensagemBoasVindas(nome, empresa, retorno) {
  const saudacao = retorno ? 'Bem-vindo(a) de volta' : 'Bem-vindo(a)';

  if (retorno) {
    return `${saudacao} ${nome} da(o) ${empresa}, fique à vontade para me conhecer um pouco mais!`;
  }

  return `${saudacao} ${nome} da(o) ${empresa}, sou a Luh e nesse site você vai saber tudo sobre minha trajetória profissional, cursos, projetos e tudo que você precisa saber para me considerar parte do seu time. Espero que goste! 😊`;
}

const experienciasDecrescente = [
  {
    periodo: 'mai 2025 - Atualmente',
    marco: 'Atual',
    empresa: 'Atento · Tempo integral',
    logo: 'AT',
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Atento_logo.png',
    corLogo: '#641052',
    cargo: 'Analista Backoffice',
    descricao: 'Suporte aos alunos da instituição Anhanguera pelo portal do aluno, em modelo home office.',
    atividades: [
      'Tratativa de chamados.',
      'Análise de documentos e situações financeiras.',
      'Suporte em dúvidas e processos do sistema interno.'
    ]
  },
  {
    periodo: 'jul 2024 - jun 2025 · 1 ano',
    marco: '2024',
    empresa: 'Estapar · Tempo integral',
    logo: 'ES',
    logoImagem: 'https://polijunior.com.br/wp-content/uploads/2024/03/estapar-case.jpeg',
    logoTamanho: 'contain',
    corLogo: '#4b2e83',
    cargo: 'Manobrista',
    descricao: 'Responsável por manobras e cuidado com veículos dos clientes.',
    atividades: [
      'Manobra de veículos.',
      'Atendimento aos clientes.',
      'Organização e cuidado no fluxo de estacionamento.'
    ]
  },
  {
    periodo: 'mar 2023 - ago 2023 · 6 meses',
    marco: '2023',
    empresa: 'Mercado Livre · Terceirizado',
    logo: 'ML',
    logoImagem: 'https://bring.com.br/blog/wp-content/uploads/2018/05/Mercado-Livre-logo-300x84.png',
    logoTamanho: 'contain',
    corLogo: '#816400',
    cargo: 'Representante de envios',
    descricao: 'Atuação em processos de separação, registro e expedição de mercadorias.',
    atividades: [
      'Separação e registro de mercadorias.',
      'Expedição de pedidos.',
      'Auxílio no controle de perdas e eventos da empresa.'
    ]
  },
  {
    periodo: 'mai 2021 - jan 2022 · 9 meses',
    marco: '2021',
    empresa: 'RGIS Ivalis · Tempo integral',
    logo: 'RGIS',
    logoTextoCor: '#1f3f77',
    corLogo: '#1f3f77',
    cargo: 'Auxiliar de logística',
    descricao: 'Atuação na conferência de entrada e saída de mercadorias e inventário, em modelo presencial em São Paulo, Brasil.',
    atividades: [
      'Controle de estoque e validade.',
      'Conferência e armazenamento de mercadorias.',
      'Entrega de resultados exatos dentro do prazo.'
    ]
  },
  {
    periodo: 'ago 2018 - abr 2021 · 2 anos 9 meses',
    marco: '2018',
    empresa: 'Uber · Autônomo',
    logo: 'UB',
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg',
    corLogo: '#111111',
    cargo: 'Motorista',
    descricao: 'Atuação como motorista de aplicativo.',
    atividades: [
      'Transporte de passageiros por aplicativo.',
      'Atendimento direto aos clientes.',
      'Organização da rotina de trabalho autônomo.'
    ]
  },
  {
    periodo: 'jan 2017 - ago 2018 · 1 ano 8 meses',
    marco: '2017',
    empresa: 'Ricardo Eletro · Tempo integral',
    logo: 'RE',
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Ricardo_Eletro_logo.svg',
    corLogo: '#b21f2d',
    cargo: 'Estoquista',
    descricao: 'Trabalho em estoque de área restrita com celulares, produtos tecnológicos e itens de maior valor.',
    atividades: [
      'Recebimento e conferência de mercadorias.',
      'Controle de estoque em área restrita.',
      'Organização de produtos tecnológicos e itens de confiança.'
    ]
  },
  {
    periodo: 'abr 2015 - jan 2017 · 1 ano 10 meses',
    marco: '2015',
    empresa: 'Drogaria Araujo · Tempo integral',
    logo: 'DA',
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Drogaria_Araujo_Logo.jpg',
    corLogo: '#1f7a3a',
    cargo: 'Auxiliar de logística sênior',
    descricao: 'Atuação em separação, registro, expedição de mercadorias e apoio a vendas internas.',
    atividades: [
      'Separação de mercadorias.',
      'Registro de saída no sistema.',
      'Criação de rotas para motociclistas e apoio em expedição.'
    ]
  },
  {
    periodo: 'mar 2014 - jan 2015 · 11 meses',
    marco: '2014',
    empresa: 'AeC · Tempo integral',
    logo: 'AC',
    logoImagem: 'https://www.aec.com.br/wp-content/themes/aec/dist/img/logotipo.webp',
    logoOpacidade: 0.55,
    corLogo: '#0b7285',
    cargo: 'Atendimento ao cliente',
    descricao: 'Atendimento ao público para serviços de saúde da Unimed BH.',
    atividades: [
      'Agendamento de consultas.',
      'Agendamento de exames.',
      'Atendimento e orientação aos beneficiários.'
    ]
  },
  {
    periodo: 'jan 2012 - dez 2012 · 1 ano',
    marco: '2012',
    empresa: 'thyssenkrupp · Jovem Aprendiz',
    logo: 'TK',
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Thyssenkrupp_AG_Logo_2015.svg/120px-Thyssenkrupp_AG_Logo_2015.svg.png',
    corLogo: '#003c7d',
    cargo: 'Assistente administrativo',
    descricao: 'Atuação em rotinas administrativas e suporte ao departamento de TI.',
    atividades: [
      'Auxílio administrativo e organização de arquivos.',
      'Apoio em atividades do departamento de TI.',
      'Aprendizado prático em ambiente corporativo.'
    ]
  }
];
const experiencias = experienciasDecrescente.slice().reverse();
let experienciaAtual = experiencias.length - 1;
let experienciaAnimando = false;

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function textoPareceAleatorio(texto) {
  const textoLimpo = normalizarTexto(texto).replace(/[^a-z0-9 ]/g, '');
  const partes = textoLimpo.split(/\s+/).filter(Boolean);
  const textoSemEspaco = textoLimpo.replace(/\s/g, '');
  const bloqueados = ['alguem', 'teste', 'test', 'xxxx', 'xxx', 'asdf', 'qwerty', 'nome', 'empresa'];

  if (!textoSemEspaco || bloqueados.includes(textoSemEspaco)) {
    return true;
  }

  if (/(.)\1{2,}/.test(textoSemEspaco)) {
    return true;
  }

  if (!/[aeiou]/.test(textoSemEspaco)) {
    return true;
  }

  if (partes.some((parte) => parte.length > 12 && !/[aeiou].*[aeiou]/.test(parte))) {
    return true;
  }

  return false;
}

function nomeValido(nome) {
  const valor = nome.trim().replace(/\s+/g, ' ');
  const partes = valor.split(' ');
  const somenteLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(valor);

  return somenteLetras
    && partes.length >= 2
    && partes.every((parte) => parte.length >= 2)
    && valor.length <= 80
    && !textoPareceAleatorio(valor);
}

function empresaValida(empresa) {
  // Empresa deve ter pelo menos 2 caracteres
  const valor = String(empresa || '').trim();
  return valor.length >= 2;
}

function exibirMensagemLogin(mensagem, campo, tipo = 'erro') {
  if (mensagemLogin) {
    mensagemLogin.textContent = mensagem;
    mensagemLogin.classList.remove('login-mensagem--sucesso', 'login-mensagem--info', 'login-mensagem--erro');
    if (mensagem) {
      mensagemLogin.classList.add(`login-mensagem--${tipo}`);
    }
  }

  [campoNomeVisitante, campoEmpresaVisitante].forEach((input) => {
    input?.classList.toggle('invalido', input === campo);
  });

  campo?.focus();
}

function fecharToast() {
  if (!toastNotificacao) {
    return;
  }

  toastNotificacao.classList.remove('toast-notificacao--visivel');
}

function mostrarToast(mensagem, tipo = 'sucesso') {
  if (!toastNotificacao || !mensagem) {
    return;
  }

  toastNotificacao.textContent = '';

  const textoMensagem = document.createElement('div');
  textoMensagem.textContent = mensagem;

  const botaoOk = document.createElement('button');
  botaoOk.type = 'button';
  botaoOk.className = 'toast-notificacao__botao';
  botaoOk.setAttribute('aria-label', 'Fechar mensagem');
  botaoOk.textContent = 'OK';

  toastNotificacao.append(textoMensagem, botaoOk);
  toastNotificacao.classList.remove('toast-notificacao--sucesso', 'toast-notificacao--info', 'toast-notificacao--erro', 'toast-notificacao--visivel');
  toastNotificacao.classList.add(`toast-notificacao--${tipo}`, 'toast-notificacao--visivel');

  botaoOk.addEventListener('click', fecharToast, { once: true });
}

function validarAcesso() {
  if (!campoNomeVisitante || !campoEmpresaVisitante) {
    return null;
  }

  const nome = campoNomeVisitante.value.trim().replace(/\s+/g, ' ');
  const empresa = campoEmpresaVisitante.value.trim().replace(/\s+/g, ' ');

  if (!nomeValido(nome)) {
    exibirMensagemLogin('Digite um nome válido', campoNomeVisitante, 'erro');
    return null;
  }

  if (!empresaValida(empresa)) {
    exibirMensagemLogin('Digite uma empresa válida', campoEmpresaVisitante, 'erro');
    return null;
  }

  exibirMensagemLogin('', null, 'info');
  return { nome, empresa };
}

function atualizarBotaoAcesso() {
  if (!campoNomeVisitante || !campoEmpresaVisitante || !botaoAcessarSite) {
    return;
  }

  botaoAcessarSite.hidden = !campoNomeVisitante.value.trim();
}

[campoNomeVisitante, campoEmpresaVisitante].forEach((input) => {
  ['input', 'change', 'blur'].forEach(evento => input?.addEventListener(evento, () => {
    input.classList.remove('invalido');
    if (mensagemLogin) {
      mensagemLogin.textContent = '';
    }
    atualizarBotaoAcesso();
  }));
});

formularioAcesso?.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  if (isGithubPages && !neonDataApiUrl && !backendApiUrl) {
    exibirMensagemLogin('Configure a Neon Data API para registrar visitas neste site.', null, 'erro');
    return;
  }

  const dadosAcesso = validarAcesso();

  if (!dadosAcesso) {
    return;
  }

  botaoAcessarSite.disabled = true;
  botaoAcessarSite.textContent = 'Registrando...';

  try {
    const acessoAnterior = await existeAcessoAnterior(dadosAcesso.nome, dadosAcesso.empresa);
    await registrarVisita(dadosAcesso);

    const mensagem = mensagemBoasVindas(dadosAcesso.nome, dadosAcesso.empresa, acessoAnterior);
    popupAcesso?.classList.add('oculto');
    body.classList.remove('acesso-bloqueado');
    mostrarToast(mensagem, 'sucesso');
  } catch (erro) {
    exibirMensagemLogin(erro.message || 'Erro ao conectar com a Neon Data API.');
  } finally {
    botaoAcessarSite.disabled = false;
    botaoAcessarSite.textContent = 'Acessar site';
  }
});

atualizarBotaoAcesso();

function criarLogoFundo(texto, cor, imagem, corTexto) {
  const criarSvgTexto = () => {
    const svgTexto = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 180">
        <text x="50%" y="56%" text-anchor="middle" dominant-baseline="middle"
          font-family="Verdana, Arial, sans-serif" font-size="72" font-weight="800" fill="${corTexto || cor}">${texto}</text>
      </svg>
    `;

    return `url("data:image/svg+xml,${encodeURIComponent(svgTexto)}")`;
  };

  if (imagem) {
    if (texto.length > 2) {
      return `url("${imagem}"), ${criarSvgTexto()}`;
    }

    return `url("${imagem}")`;
  }

  if (texto.length > 2) {
    return criarSvgTexto();
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
      <rect width="420" height="420" rx="54" fill="${cor}"/>
      <circle cx="330" cy="88" r="58" fill="#ffffff" opacity="0.18"/>
      <circle cx="88" cy="334" r="74" fill="#ffffff" opacity="0.12"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Verdana, Arial, sans-serif" font-size="118" font-weight="700" fill="#ffffff">${texto}</text>
    </svg>
  `;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

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

function exibirExperiencia(indice) {
  const experiencia = experiencias[indice];
  const periodo = document.getElementById('experiencia-periodo');
  const empresa = document.getElementById('experiencia-empresa');
  const cargo = document.getElementById('experiencia-cargo');
  const descricao = document.getElementById('experiencia-descricao');
  const atividades = document.getElementById('experiencia-atividades');
  const card = document.querySelector('.experiencia-conteudo');

  if (!periodo || !empresa || !cargo || !descricao || !atividades) {
    return;
  }

  periodo.textContent = experiencia.periodo;
  empresa.textContent = experiencia.empresa;
  cargo.textContent = experiencia.cargo;
  descricao.textContent = experiencia.descricao;
  card?.style.setProperty('--logo-fundo', criarLogoFundo(experiencia.logoTexto ?? experiencia.logo, experiencia.corLogo, experiencia.logoImagem, experiencia.logoTextoCor));
  card?.style.setProperty('--logo-tamanho', experiencia.logoTamanho ?? 'contain');
  card?.style.setProperty('--logo-opacidade', experiencia.logoOpacidade ?? 0.28);
  atividades.innerHTML = '';

  experiencia.atividades.forEach((atividade) => {
    const item = document.createElement('li');
    item.textContent = atividade;
    atividades.appendChild(item);
  });

  atualizarLinhaTempo();
}

function criarLinhaTempo() {
  const linhaTempo = document.getElementById('experiencia-linha-tempo');

  if (!linhaTempo) {
    return;
  }

  linhaTempo.innerHTML = '';
  linhaTempo.style.setProperty('--quantidade-experiencias', experiencias.length);

  experiencias.forEach((experiencia, indice) => {
    const marco = document.createElement('button');
    const periodo = document.createElement('span');

    marco.type = 'button';
    marco.className = 'experiencia-marco';
    marco.setAttribute('aria-label', `Ver experiência em ${experiencia.empresa}`);
    periodo.textContent = experiencia.marco;

    marco.appendChild(periodo);
    marco.addEventListener('click', () => {
      trocarExperienciaPorIndice(indice);
    });

    linhaTempo.appendChild(marco);
  });
}

function atualizarLinhaTempo() {
  const marcos = document.querySelectorAll('.experiencia-marco');

  marcos.forEach((marco, indice) => {
    const ativo = indice === experienciaAtual;
    marco.classList.toggle('ativo', ativo);
    marco.setAttribute('aria-current', ativo ? 'step' : 'false');
  });

  atualizarSetasExperiencia();
}

function atualizarSetasExperiencia(animando = false) {
  const botaoAnterior = document.getElementById('experiencia-anterior');
  const botaoProxima = document.getElementById('experiencia-proxima');

  if (botaoAnterior) {
    const semExperienciaAnterior = experienciaAtual === 0;
    botaoAnterior.classList.toggle('indisponivel', semExperienciaAnterior);
    botaoAnterior.setAttribute('aria-hidden', semExperienciaAnterior ? 'true' : 'false');
    botaoAnterior.disabled = animando || semExperienciaAnterior;
  }

  if (botaoProxima) {
    const semProximaExperiencia = experienciaAtual === experiencias.length - 1;
    botaoProxima.classList.toggle('indisponivel', semProximaExperiencia);
    botaoProxima.setAttribute('aria-hidden', semProximaExperiencia ? 'true' : 'false');
    botaoProxima.disabled = animando || semProximaExperiencia;
  }
}

function trocarExperiencia(direcao, indiceDestino = null) {
  if (experienciaAnimando) {
    return;
  }

  if (
    indiceDestino === null
    && ((direcao === 'proxima' && experienciaAtual === experiencias.length - 1)
      || (direcao === 'anterior' && experienciaAtual === 0))
  ) {
    return;
  }

  const card = document.querySelector('.experiencia-conteudo');

  if (!card) {
    return;
  }

  experienciaAnimando = true;
  atualizarSetasExperiencia(true);

  const saindo = direcao === 'proxima' ? 'pagina-saindo-proxima' : 'pagina-saindo-anterior';
  const entrando = direcao === 'proxima' ? 'pagina-entrando-proxima' : 'pagina-entrando-anterior';
  card.classList.add(saindo);

  setTimeout(() => {
    experienciaAtual = indiceDestino ?? (
      direcao === 'proxima'
        ? experienciaAtual + 1
        : experienciaAtual - 1
    );

    exibirExperiencia(experienciaAtual);
    card.classList.remove(saindo);
    card.classList.add(entrando);
  }, 260);

  setTimeout(() => {
    card.classList.remove(entrando);
    experienciaAnimando = false;
    atualizarSetasExperiencia();
  }, 620);
}

function trocarExperienciaPorIndice(indice) {
  if (indice === experienciaAtual || experienciaAnimando) {
    return;
  }

  trocarExperiencia(indice > experienciaAtual ? 'proxima' : 'anterior', indice);
}

document.getElementById('experiencia-anterior')?.addEventListener('click', () => {
  trocarExperiencia('anterior');
});

document.getElementById('experiencia-proxima')?.addEventListener('click', () => {
  trocarExperiencia('proxima');
});

criarLinhaTempo();
exibirExperiencia(experienciaAtual);
exibirPainel('video');

// Aqui eu separo os elementos principais da tela para conseguir controlar o site pelo JavaScript.
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
const luhChat = document.getElementById('luh-chat');
const luhChatBotao = document.getElementById('luh-chat-botao');
const luhChatJanela = document.getElementById('luh-chat-janela');
const luhChatFechar = document.getElementById('luh-chat-fechar');
const luhChatMensagens = document.getElementById('luh-chat-mensagens');
const luhChatForm = document.getElementById('luh-chat-form');
const luhChatInput = document.getElementById('luh-chat-input');

// Configurações que eu uso para conectar o front-end com a Neon Data API e a Neon Auth.
// Mantive esses valores no começo do arquivo para ficar fácil trocar caso eu mude de projeto no Neon.
const neonDataApiUrl = window.NEON_DATA_API_URL || 'https://ep-aged-band-ac33aasw.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1';
const neonAuthUrl = window.NEON_AUTH_URL || 'https://ep-aged-band-ac33aasw.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
const neonDataApiToken = window.NEON_DATA_API_TOKEN || '';
const backendApiUrl = window.PORTFOLIO_API_URL || '';

const isGithubPages = window.location.hostname.includes('github.io');
// Aqui eu escolho qual API usar conforme o ambiente: local para testes ou Neon no site publicado.
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

// A Neon Data API exige um JWT. Esta função cria ou reaproveita uma sessão técnica da Neon Auth.
async function obterTokenNeon() {
  if (neonDataApiToken) {
    return neonDataApiToken;
  }

  const origemAtual = window.location.origin;
  const lerErroAuth = async (resposta) => {
    const erro = await resposta.json().catch(() => ({}));
    const mensagem = erro.message || erro.erro || `Erro ${resposta.status}`;
    return `${mensagem}. Origem atual: ${origemAtual}`;
  };

  // Primeiro tento reaproveitar uma sessão já existente para não criar usuário novo a cada visita.
  const sessaoAtual = await fetch(`${neonAuthUrl}/get-session`, {
    credentials: 'include'
  });
  const tokenAtual = sessaoAtual.headers.get('set-auth-jwt');

  if (tokenAtual) {
    return tokenAtual;
  }

  // Se ainda não existir sessão, salvo credenciais técnicas no navegador para autenticar as próximas chamadas.
  const credenciaisSalvas = JSON.parse(localStorage.getItem('neon_auth_visitante') || 'null');
  const credenciais = credenciaisSalvas || {
    email: `visitante-${crypto.randomUUID()}@portfolio.local`,
    password: crypto.randomUUID(),
    name: 'Visitante Portfolio'
  };

  const autenticar = (endpoint, dados) => fetch(`${neonAuthUrl}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  let respostaAuth = await autenticar(credenciaisSalvas ? 'sign-in/email' : 'sign-up/email', credenciais);

  // Se as credenciais salvas ficarem inválidas, eu limpo e crio uma sessão nova automaticamente.
  if (!respostaAuth.ok && credenciaisSalvas) {
    localStorage.removeItem('neon_auth_visitante');
    const novasCredenciais = {
      email: `visitante-${crypto.randomUUID()}@portfolio.local`,
      password: crypto.randomUUID(),
      name: 'Visitante Portfolio'
    };

    respostaAuth = await autenticar('sign-up/email', novasCredenciais);
    if (respostaAuth.ok) {
      localStorage.setItem('neon_auth_visitante', JSON.stringify(novasCredenciais));
    }
  }

  if (!respostaAuth.ok) {
    localStorage.removeItem('neon_auth_visitante');
    throw new Error(`Não foi possível criar sessão na Neon Auth: ${await lerErroAuth(respostaAuth)}`);
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

// Converto datas ISO do banco para o formato brasileiro que aparece no site.
function formatarData(dataIso) {
  if (!dataIso) {
    return '';
  }

  const [ano, mes, dia] = String(dataIso).split('T')[0].split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : dataIso;
}

function dataSaoPaulo(data = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(data);

  const valor = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]));
  return `${valor.year}-${valor.month}-${valor.day}`;
}

// Busco visitas para saber se a pessoa já acessou antes e personalizar a mensagem de boas-vindas.
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

// Salvo a visita no banco com nome, empresa, data, IP e navegador quando essas informações estão disponíveis.
async function registrarVisita(dadosAcesso) {
  if (!urlApiVisitas || urlApiVisitas === '/api/visitas') {
    throw new Error('API de visitas não configurada');
  }

  const entradaVisitante = new Date();
  const dadosLocalizacao = await obterLocalizacaoVisitante();

  if (neonDataApiUrl) {
    const resposta = await fetch(urlApiVisitas, {
      method: 'POST',
      headers: await cabecalhosNeon(),
      body: JSON.stringify({
        nome: dadosAcesso.nome,
        empresa: dadosAcesso.empresa,
        data_visita: dataSaoPaulo(entradaVisitante),
        criado_em: entradaVisitante.toISOString(),
        ip: dadosLocalizacao.ip,
        localizacao: dadosLocalizacao.localizacao,
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
    body: JSON.stringify({
      ...dadosAcesso,
      criado_em: entradaVisitante.toISOString(),
      ip: dadosLocalizacao.ip,
      localizacao: dadosLocalizacao.localizacao
    })
  });

  const resultado = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(resultado.erro || 'Não foi possível registrar sua visita');
  }

  return resultado;
}

function montarLocalizacao(dados) {
  const estadosBrasil = {
    AC: 'Acre',
    AL: 'Alagoas',
    AP: 'Amapá',
    AM: 'Amazonas',
    BA: 'Bahia',
    CE: 'Ceará',
    DF: 'Distrito Federal',
    ES: 'Espírito Santo',
    GO: 'Goiás',
    MA: 'Maranhão',
    MT: 'Mato Grosso',
    MS: 'Mato Grosso do Sul',
    MG: 'Minas Gerais',
    PA: 'Pará',
    PB: 'Paraíba',
    PR: 'Paraná',
    PE: 'Pernambuco',
    PI: 'Piauí',
    RJ: 'Rio de Janeiro',
    RN: 'Rio Grande do Norte',
    RS: 'Rio Grande do Sul',
    RO: 'Rondônia',
    RR: 'Roraima',
    SC: 'Santa Catarina',
    SP: 'São Paulo',
    SE: 'Sergipe',
    TO: 'Tocantins'
  };
  const codigoPais = String(dados.country_code || dados.countryCode || '').toUpperCase();
  const paisInformado = dados.country_name || dados.country || dados.countryName || '';
  const pais = codigoPais === 'BR' || paisInformado === 'Brazil' || paisInformado === 'BR' ? 'Brasil' : paisInformado;
  const cidade = dados.city || dados.city_name || '';
  const codigoEstado = String(dados.region_code || dados.regionCode || '').toUpperCase();
  const estadoInformado = dados.region || dados.regionName || dados.region_name || '';
  const estado = pais === 'Brasil'
    ? (estadosBrasil[codigoEstado] || estadoInformado)
    : (estadoInformado || codigoEstado);
  const partes = [pais, estado, cidade]
    .map((parte) => String(parte || '').trim())
    .filter(Boolean);

  return partes.length ? partes.join(', ') : 'Não identificada';
}

function localizacaoPorFuso() {
  const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (fuso === 'America/Sao_Paulo') {
    return 'Brasil, São Paulo, São Paulo';
  }

  if (fuso?.startsWith('America/')) {
    return `Fuso da máquina: ${fuso}`;
  }

  return 'Não identificada';
}

// Uso o IP público para estimar país, cidade e estado. Se falhar, o acesso continua normalmente.
async function obterLocalizacaoVisitante() {
  const servicos = [
    {
      url: 'https://ipapi.co/json/',
      adaptar: (dados) => ({
        ip: dados.ip || null,
        localizacao: montarLocalizacao(dados)
      })
    },
    {
      url: 'https://ipwho.is/',
      adaptar: (dados) => ({
        ip: dados.ip || null,
        localizacao: montarLocalizacao({
          country_name: dados.country,
          country_code: dados.country_code,
          city: dados.city,
          region_code: dados.region_code,
          region: dados.region
        })
      })
    }
  ];

  for (const servico of servicos) {
    try {
      const resposta = await fetch(servico.url);
      if (!resposta.ok) {
        continue;
      }

      const dados = await resposta.json();
      const resultado = servico.adaptar(dados);

      if (resultado.localizacao && resultado.localizacao !== 'Não identificada') {
        return resultado;
      }
    } catch (_erro) {
      // Tento o próximo serviço antes de desistir.
    }
  }

  return { ip: null, localizacao: localizacaoPorFuso() };
}

// Comparo nome e empresa para descobrir se é uma visita repetida.
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

// Mensagem que aparece depois que a visita é registrada com sucesso.
function mensagemBoasVindas(nome, empresa, retorno) {
  const saudacao = retorno ? 'Bem-vindo(a) de volta' : 'Bem-vindo(a)';

  if (retorno) {
    return `${saudacao} ${nome} da(o) ${empresa}, fique à vontade para me conhecer um pouco mais!`;
  }

  return `${saudacao} ${nome} da(o) ${empresa}, sou a Luh e nesse site você vai saber tudo sobre minha trajetória profissional, cursos, projetos e tudo que você precisa saber para me considerar parte do seu time. Espero que goste! 😊`;
}

// Base de respostas da Luh. Eu deixei os textos com um tom mais natural e voltado aos meus focos profissionais.
const respostasLuh = [
  {
    termos: ['experiencia', 'experiências', 'trabalho', 'trabalhou', 'carreira', 'profissional'],
    resposta: 'Ah, ótima pergunta! A Luana tem uma trajetória bem prática e diversa. Ela já passou por logística, atendimento, estoque, operações e hoje atua como Analista Backoffice, lidando com chamados, documentos, processos financeiros e suporte a alunos. Essa mistura mostra alguém organizada, adaptável e acostumada a resolver problema de verdade no dia a dia.'
  },
  {
    termos: ['logistica', 'logística', 'estoque', 'separacao', 'separação', 'expedicao', 'expedição'],
    resposta: 'Sim! A Luana tem bastante vivência em logística e operação. Ela já trabalhou com separação e registro de mercadorias, expedição, controle de estoque, conferência, validade e organização de produtos. É uma experiência bem mão na massa, daquelas que ensinam atenção, ritmo e responsabilidade.'
  },
  {
    termos: ['projeto', 'projetos', 'portfolio', 'portfólio', 'site', 'desenvolveu'],
    resposta: 'Os principais projetos da Luana são: Automação com Python, com cadastro automático de produtos por CSV, interface gráfica, pausa, interrupção e executável; Dashboard Financeiro no Power BI, com análise de receita, despesas, impostos, lucro, margem de lucro, bancos e transações; Dashboard de RH no Power BI, com análise de contratações, ativos, demissões, turnover, gênero, cidade, área e cargo; Dashboard de Produção no Power BI, com análise de produção individual por funcionário, mês, horas produtivas, horas paradas e rejeições; Dashboard de Vendas no Power BI, com tratamento de dados no Power Query e visualização de faturamento, produtos, categorias e países; Portal Vila Industrial, um site institucional responsivo com abas, linha do tempo e mapa; Agente de IA, em Python, com triagem inteligente, RAG, LangChain e LangGraph; Réplica Apple Watch, interface front-end com HTML, CSS e JavaScript; Audio-Book, player interativo em JavaScript; interface de celular com iframe e links; e este Portfólio Pessoal, que apresenta trajetória, formação, cursos, experiências, projetos, login de visitantes, painel admin e a própria Luh.'
  },
  {
    termos: ['curso', 'cursos', 'certificado', 'certificados', 'qual curso', 'quais cursos'],
    resposta: 'Na aba de cursos, a Luana tem: n8n (agentes de IA), Python AI, Automação e Dados, Teste de Inglês B1 Intermediário, Analytics & Inteligência Artificial, Hardware, Rede de computadores, Excel, Algoritmos e Lógica de Programação, Power BI, MySQL, HTML5 + CSS3, Fundamentos e masterclass Python, Marketing Digital e Inteligência Artificial, DEV Agentes de IA Google e Intensivão de JavaScript.'
  },
  {
    termos: ['skill', 'skills', 'tecnologia', 'tecnologias', 'programacao', 'programação', 'javascript', 'html', 'css', 'mysql', 'n8n', 'python', 'automacao', 'automação', 'ia', 'chatbot', 'chatbox'],
    resposta: 'O foco profissional da Luana está bem voltado para automação de processos, MySQL, n8n, Python, agentes de IA e chatbots. Ela gosta de criar soluções que conectam sistemas, organizam dados e reduzem trabalho manual. Front-end entra como apoio para apresentar essas soluções de forma clara, mas o coração do interesse dela está em automação e inteligência aplicada.'
  },
  {
    termos: ['automacao', 'automação', 'processo', 'processos', 'fluxo', 'fluxos', 'n8n'],
    resposta: 'Essa é uma das áreas que mais combinam com a Luana. Ela tem interesse em automação de processos usando ferramentas como n8n e Python para criar fluxos, integrar sistemas e diminuir tarefas repetitivas. Um exemplo prático é o projeto Automação com Python, em que ela criou uma ferramenta com interface gráfica, leitura de CSV, controle por botões e executável para automatizar cadastro de produtos.'
  },
  {
    termos: ['inteligencia artificial', 'inteligência artificial', 'agente', 'agentes', 'ia', 'chatbot', 'chatbox'],
    resposta: 'A Luana está direcionando bastante energia para agentes de IA e chatbots. Ela gosta da ideia de criar assistentes que entendem perguntas, ajudam pessoas, consultam informações e tornam um processo mais simples. Esse próprio chat da Luh é um exemplo desse caminho aplicado no portfólio.'
  },
  {
    termos: ['mysql', 'banco', 'dados', 'database', 'sql'],
    resposta: 'Na parte de dados, a Luana tem foco em MySQL e modelagem prática para guardar, consultar e organizar informações. Ela também vem trabalhando com integração entre site, API e banco, como o cadastro de visitas do portfólio, que registra informações em banco de dados.'
  },
  {
    termos: ['python', 'pyhton'],
    resposta: 'Python é um dos focos profissionais da Luana porque combina muito com automação, análise de dados, scripts e agentes de IA. Ela quer usar Python para criar soluções úteis, automatizar tarefas e conectar ferramentas de forma mais inteligente.'
  },
  {
    termos: ['formacao', 'formação', 'faculdade', 'estudo', 'estudos', 'engenharia de software', 'senai'],
    resposta: 'Na formação, a Luana está cursando Bacharelado em Engenharia de Software pela Universidade Anhanguera, de 07/2025 a 06/2029. Ela também fez Processos Administrativos no SENAI Américo Rennê Giannetti entre 2011 e 2012, e concluiu o Ensino Médio na E.E. Leonina Mourthé De Araújo.'
  },
  {
    termos: ['contato', 'contratar', 'linkedin', 'email', 'e-mail', 'whatsapp', 'telefone', 'falar', 'chamar'],
    resposta: 'Para falar com a Luana, o contato preferencial é por email ou WhatsApp: euluanamozer@gmail.com e (11) 99609-3403. Também dá para conhecer mais pelo LinkedIn linkedin.com/in/luanamozer, GitHub github.com/Luana-Mozer e YouTube youtube.com/@luanamozer.'
  },
  {
    termos: ['quem', 'sobre', 'luana', 'luh', 'apresenta', 'apresentação', 'curriculo', 'currículo', 'resumo'],
    resposta: 'A Luana de Oliveira Mozer é estudante de Engenharia de Software, mora em São Paulo na Zona Leste e faz parte da diversidade como mulher transgênero. Ela tem experiência em atendimento, backoffice, análise de chamados e rotinas operacionais, além de projetos práticos em HTML, CSS, JavaScript, Python, Power BI, MySQL, hardware, redes e agentes de IA. Hoje ela busca crescer em desenvolvimento, tecnologia, automação e inteligência artificial.'
  },
  {
    termos: ['idioma', 'idiomas', 'ingles', 'inglês', 'espanhol', 'portugues', 'português'],
    resposta: 'Nos idiomas, a Luana tem Português nativo, Inglês B1 intermediário e Espanhol B1 intermediário.'
  },
  {
    termos: ['atual', 'atualmente', 'backoffice', 'atento'],
    resposta: 'Atualmente, a Luana atua como Analista Backoffice na Atento, em modelo home office, prestando suporte a alunos, tratando chamados, analisando documentos e acompanhando processos internos. É uma função que exige atenção, comunicação e organização.'
  }
];

const sugestoesLuh = [
  'Quais são suas experiências?',
  'Quais cursos você fez?',
  'Você trabalha com automação?',
  'Você cria agentes de IA?',
  'Qual o melhor contato?'
];

// Adiciona uma mensagem no chat, separando visualmente o que é meu assistente e o que é pergunta do visitante.
function adicionarMensagemLuh(texto, autor = 'luh') {
  if (!luhChatMensagens) {
    return null;
  }

  const mensagem = document.createElement('div');
  mensagem.className = `luh-chat__mensagem luh-chat__mensagem--${autor}`;
  mensagem.textContent = texto;
  luhChatMensagens.appendChild(mensagem);
  luhChatMensagens.scrollTop = luhChatMensagens.scrollHeight;
  return mensagem;
}

// Crio botões de sugestão para facilitar a primeira interação com o chat.
function criarSugestoesLuh() {
  if (!luhChatMensagens) {
    return;
  }

  const sugestoes = document.createElement('div');
  sugestoes.className = 'luh-chat__sugestoes';

  sugestoesLuh.forEach((pergunta) => {
    const botaoSugestao = document.createElement('button');
    botaoSugestao.type = 'button';
    botaoSugestao.textContent = pergunta;
    botaoSugestao.addEventListener('click', () => responderLuh(pergunta));
    sugestoes.appendChild(botaoSugestao);
  });

  luhChatMensagens.appendChild(sugestoes);
}

// Procuro a melhor resposta pela intenção da pergunta, usando palavras-chave simples.
function responderLuh(pergunta) {
  const perguntaLimpa = String(pergunta || '').trim();
  if (!perguntaLimpa) {
    return;
  }

  adicionarMensagemLuh(perguntaLimpa, 'usuario');
  if (luhChatInput) {
    luhChatInput.value = '';
  }

  const perguntaNormalizada = normalizarTexto(perguntaLimpa);
  const respostaEncontrada = respostasLuh.find((item) =>
    item.termos.some((termo) => perguntaNormalizada.includes(normalizarTexto(termo)))
  );

  const resposta = respostaEncontrada?.resposta
    || 'Hmm, boa pergunta! Posso te contar sobre a trajetória da Luana, experiências, projetos, tecnologias, cursos ou formas de contato. Se quiser, pergunta de outro jeito que eu tento te responder melhor.';

  window.setTimeout(() => {
    adicionarMensagemLuh(resposta, 'luh');
  }, 350);
}

// Abre o chat e mostra a primeira mensagem da Luh apenas uma vez.
function abrirChatLuh() {
  if (!luhChat || !luhChatBotao || !luhChatJanela) {
    return;
  }

  luhChat.classList.add('aberto');
  luhChatBotao.setAttribute('aria-expanded', 'true');
  luhChatJanela.setAttribute('aria-hidden', 'false');

  if (!luhChatMensagens?.dataset.iniciado) {
    adicionarMensagemLuh('Oi! Eu sou a Luh 😊 Pode me perguntar sobre experiências, projetos, tecnologias ou contato da Luana.');
    criarSugestoesLuh();
    luhChatMensagens.dataset.iniciado = 'true';
  }

  window.setTimeout(() => luhChatInput?.focus(), 100);
}

// Fecha o chat sem apagar o histórico da conversa.
function fecharChatLuh() {
  if (!luhChat || !luhChatBotao || !luhChatJanela) {
    return;
  }

  luhChat.classList.remove('aberto');
  luhChatBotao.setAttribute('aria-expanded', 'false');
  luhChatJanela.setAttribute('aria-hidden', 'true');
}

luhChatBotao?.addEventListener('click', () => {
  if (luhChat?.classList.contains('aberto')) {
    fecharChatLuh();
    return;
  }

  abrirChatLuh();
});

luhChatFechar?.addEventListener('click', fecharChatLuh);

luhChatForm?.addEventListener('submit', (evento) => {
  evento.preventDefault();
  responderLuh(luhChatInput?.value);
});

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

// Normalizo textos para validar nomes e comparar palavras sem depender de acentos ou maiúsculas.
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Esta validação evita registros muito aleatórios no formulário inicial do portfólio.
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

// Valido o nome para incentivar a pessoa a informar pelo menos nome e sobrenome.
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

// Valido a empresa de forma simples, porque o campo pode ser nome de empresa, área ou referência profissional.
function empresaValida(empresa) {
  // Empresa deve ter pelo menos 2 caracteres
  const valor = String(empresa || '').trim();
  return valor.length >= 2;
}

// Mostro mensagens de erro ou sucesso no formulário de entrada.
function exibirMensagemLogin(mensagem, campo, tipo = 'erro') {
  if (mensagemLogin) {
    mensagemLogin.textContent = mensagem;
    mensagemLogin.classList.remove('login-mensagem--sucesso', 'login-mensagem--info', 'login-mensagem--erro');
    mensagemLogin.hidden = !mensagem;
    if (mensagem) {
      mensagemLogin.classList.add(`login-mensagem--${tipo}`);
    }
  }

  [campoNomeVisitante, campoEmpresaVisitante].forEach((input) => {
    input?.classList.toggle('invalido', input === campo);
  });

  campo?.focus();
}

// Fecho o aviso de boas-vindas quando a pessoa clica em OK.
function fecharToast() {
  if (!toastNotificacao) {
    return;
  }

  toastNotificacao.classList.remove('toast-notificacao--visivel');
}

// Crio o toast sem innerHTML para evitar inserir conteúdo digitado pelo visitante como HTML.
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

// Centralizo a validação dos campos antes de tentar gravar a visita no banco.
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

  exibirMensagemLogin('', null);
  return { nome, empresa };
}

// O botão só aparece depois que a pessoa começa a preencher o nome.
function atualizarBotaoAcesso() {
  if (!campoNomeVisitante || !campoEmpresaVisitante || !botaoAcessarSite) {
    return;
  }

  const nomePreenchido = campoNomeVisitante.value.trim().length > 0;
  const empresaPreenchida = campoEmpresaVisitante.value.trim().length > 0;
  botaoAcessarSite.hidden = !(nomePreenchido && empresaPreenchida);
}

[campoNomeVisitante, campoEmpresaVisitante].forEach((input) => {
  ['input', 'change', 'blur'].forEach(evento => input?.addEventListener(evento, () => {
    input.classList.remove('invalido');
    exibirMensagemLogin('', null);
    atualizarBotaoAcesso();
  }));
});

// Fluxo principal de entrada: valido, registro no banco e libero o acesso ao portfólio.
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

// Alterno entre tema claro e escuro e salvo a escolha no navegador.
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

// Troco o painel central do portfólio sem recarregar a página.
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

// Atualizo o card de experiência profissional que aparece na linha do tempo.
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

// Crio os marcos clicáveis da linha do tempo com base na lista de experiências.
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

// Mantém o estado visual da linha do tempo e das setas de navegação.
function atualizarLinhaTempo() {
  const marcos = document.querySelectorAll('.experiencia-marco');

  marcos.forEach((marco, indice) => {
    const ativo = indice === experienciaAtual;
    marco.classList.toggle('ativo', ativo);
    marco.setAttribute('aria-current', ativo ? 'step' : 'false');
  });

  atualizarSetasExperiencia();
}

// Desabilito as setas quando não existe experiência anterior ou próxima.
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

// Faço a troca de experiência com animação para deixar a navegação mais fluida.
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

// Quando a pessoa clica em um marco específico, calculo a direção da animação.
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

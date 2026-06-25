// Configurações que uso no painel para buscar as visitas direto pela Neon Data API.
const neonDataApiUrl = window.NEON_DATA_API_URL || 'https://ep-aged-band-ac33aasw.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1';
const neonAuthUrl = window.NEON_AUTH_URL || 'https://ep-aged-band-ac33aasw.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
const neonDataApiToken = window.NEON_DATA_API_TOKEN || '';
const backendApiUrl = window.PORTFOLIO_API_URL || '';
const neonAuthTimeoutMs = 12000;
const neonAuthTentativas = 2;

// Escolho a origem dos dados conforme o ambiente em que o admin estiver aberto.
const urlApiVisitas = (() => {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const rodandoLocalmente = window.location.protocol === 'file:' || isLocalhost;

  if (rodandoLocalmente) {
    const mesmaOrigem = isLocalhost && window.location.port === '3000';
    return mesmaOrigem ? '/api/visitas' : 'http://localhost:3000/api/visitas';
  }

  if (backendApiUrl) {
    return `${backendApiUrl.replace(/\/$/, '')}/api/visitas`;
  }

  if (neonDataApiUrl) {
    return `${neonDataApiUrl.replace(/\/$/, '')}/visitas_portfolio`;
  }

  return null;
})();

const statusEl = document.getElementById('admin-status');
const visitasTable = document.getElementById('visitas-table');
const visitasBody = visitasTable.querySelector('tbody');

// Protejo a tabela contra qualquer texto vindo do banco que possa virar HTML na tela.
function textoSeguro(valor) {
  return String(valor || '-')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchComTimeout(url, opcoes = {}, timeoutMs = neonAuthTimeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...opcoes,
      signal: controller.signal
    });
  } catch (erro) {
    if (erro.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao conectar com a Neon Auth');
    }

    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAuth(url, opcoes = {}) {
  let ultimoErro = null;

  for (let tentativa = 1; tentativa <= neonAuthTentativas; tentativa += 1) {
    try {
      return await fetchComTimeout(url, opcoes);
    } catch (erro) {
      ultimoErro = erro;
      if (tentativa < neonAuthTentativas) {
        await aguardar(700 * tentativa);
      }
    }
  }

  throw ultimoErro;
}

function extrairTokenNeon(dadosAuth) {
  return dadosAuth?.data?.session?.access_token
    || dadosAuth?.session?.access_token
    || dadosAuth?.access_token
    || dadosAuth?.token
    || null;
}

// A Neon Data API precisa de JWT, então eu reaproveito a mesma autenticação técnica do site.
async function obterTokenNeon() {
  if (neonDataApiToken) {
    return neonDataApiToken;
  }

  const tokenSalvo = localStorage.getItem('neon_auth_jwt');
  if (tokenSalvo) {
    return tokenSalvo;
  }

  const origemAtual = window.location.origin;
  const lerErroAuth = async (resposta) => {
    const erro = await resposta.json().catch(() => ({}));
    const mensagem = erro.message || erro.erro || `Erro ${resposta.status}`;
    return `${mensagem}. Origem atual: ${origemAtual}`;
  };

  // Tento usar uma sessão existente antes de criar uma nova.
  const sessaoAtual = await fetchAuth(`${neonAuthUrl}/get-session`, {
    credentials: 'include'
  });
  const tokenAtual = sessaoAtual.headers.get('set-auth-jwt');

  if (tokenAtual) {
    localStorage.setItem('neon_auth_jwt', tokenAtual);
    return tokenAtual;
  }

  const dadosSessaoAtual = await sessaoAtual.json().catch(() => ({}));
  const tokenSessaoAtual = extrairTokenNeon(dadosSessaoAtual);

  if (tokenSessaoAtual) {
    localStorage.setItem('neon_auth_jwt', tokenSessaoAtual);
    return tokenSessaoAtual;
  }

  // Guardo credenciais técnicas no navegador para o admin não precisar pedir login manual.
  const credenciaisSalvas = JSON.parse(localStorage.getItem('neon_auth_visitante') || 'null');
  const credenciais = credenciaisSalvas || {
    email: `visitante-${crypto.randomUUID()}@portfolio.local`,
    password: crypto.randomUUID(),
    name: 'Visitante Portfolio'
  };
  let credenciaisAutenticadas = credenciais;

  const autenticar = (endpoint, dados) => fetchAuth(`${neonAuthUrl}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  let respostaAuth = await autenticar(credenciaisSalvas ? 'sign-in/email' : 'sign-up/email', credenciais);

  // Se a sessão salva falhar, limpo e tento criar uma nova.
  if (!respostaAuth.ok && credenciaisSalvas) {
    localStorage.removeItem('neon_auth_visitante');
    const novasCredenciais = {
      email: `visitante-${crypto.randomUUID()}@portfolio.local`,
      password: crypto.randomUUID(),
      name: 'Visitante Portfolio'
    };

    respostaAuth = await autenticar('sign-up/email', novasCredenciais);
    if (respostaAuth.ok) {
      credenciaisAutenticadas = novasCredenciais;
      localStorage.setItem('neon_auth_visitante', JSON.stringify(novasCredenciais));
    }
  }

  if (!respostaAuth.ok) {
    localStorage.removeItem('neon_auth_visitante');
    localStorage.removeItem('neon_auth_jwt');
    throw new Error(`Não foi possível criar sessão na Neon Auth: ${await lerErroAuth(respostaAuth)}`);
  }

  const dadosAuth = await respostaAuth.json().catch(() => ({}));
  const tokenAuth = respostaAuth.headers.get('set-auth-jwt') || extrairTokenNeon(dadosAuth);

  if (tokenAuth) {
    localStorage.setItem('neon_auth_visitante', JSON.stringify(credenciaisAutenticadas));
    localStorage.setItem('neon_auth_jwt', tokenAuth);
    return tokenAuth;
  }

  localStorage.setItem('neon_auth_visitante', JSON.stringify(credenciaisAutenticadas));

  const novaSessao = await fetchAuth(`${neonAuthUrl}/get-session`, {
    credentials: 'include'
  });
  const dadosNovaSessao = await novaSessao.json().catch(() => ({}));
  const novoToken = novaSessao.headers.get('set-auth-jwt') || extrairTokenNeon(dadosNovaSessao);

  if (!novoToken) {
    throw new Error('A Neon Auth não retornou um token JWT');
  }

  localStorage.setItem('neon_auth_jwt', novoToken);
  return novoToken;
}

async function cabecalhosNeon() {
  const headers = {
    'Content-Type': 'application/json'
  };

  headers.Authorization = `Bearer ${await obterTokenNeon()}`;

  return headers;
}

async function fetchNeonApi(url, opcoes = {}) {
  const montarOpcoes = async () => ({
    ...opcoes,
    headers: {
      ...(opcoes.headers || {}),
      ...(await cabecalhosNeon())
    }
  });

  let resposta = await fetch(url, await montarOpcoes());

  if (resposta.status === 401) {
    localStorage.removeItem('neon_auth_jwt');
    resposta = await fetch(url, await montarOpcoes());
  }

  return resposta;
}

// Deixo a data no formato brasileiro para a leitura do painel ficar mais rápida.
function formatarData(dataIso) {
  if (!dataIso) {
    return '';
  }

  const [ano, mes, dia] = String(dataIso).split('T')[0].split('-');
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : dataIso;
}

function dataHoraComFuso(dataHoraIso) {
  const valor = String(dataHoraIso || '');
  if (!valor) {
    return null;
  }

  const temFuso = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(valor);
  return new Date(temFuso ? valor : `${valor}Z`);
}

// Mostro apenas hora e minuto no admin, porque a data já fica em outra coluna.
function formatarHora(dataHoraIso) {
  if (!dataHoraIso) {
    return '';
  }

  const data = dataHoraComFuso(dataHoraIso);
  if (!data || Number.isNaN(data.getTime())) {
    return '';
  }

  return data.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Busco somente os campos que quero exibir no admin: nome, empresa, data, hora e localizaÃ§Ã£o.
async function buscarVisitas() {
  if (!urlApiVisitas) {
    throw new Error('API de visitas não configurada');
  }

  if (neonDataApiUrl && urlApiVisitas.includes('/rest/v1/')) {
    const resposta = await fetchNeonApi(`${urlApiVisitas}?select=id,nome,empresa,data_visita,criado_em,localizacao&order=criado_em.desc`);

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

// Mostro mensagens simples quando a tabela não puder ser carregada.
function exibirErro(mensagem) {
  statusEl.textContent = mensagem;
  visitasTable.style.display = 'none';
}

// Monto a tabela do admin sem exibir id, IP ou navegador, embora esses dados continuem no banco.
function exibirVisitas(visitas) {
  if (!visitas || visitas.length === 0) {
    statusEl.textContent = 'Nenhuma visita registrada ainda.';
    visitasTable.style.display = 'none';
    return;
  }

  visitasBody.innerHTML = visitas.map((visita) => `
    <tr>
      <td>${textoSeguro(visita.nome)}</td>
      <td>${textoSeguro(visita.empresa)}</td>
      <td>${textoSeguro(visita.data_visita)}</td>
      <td>${textoSeguro(formatarHora(visita.criado_em))}</td>
      <td>${textoSeguro(visita.localizacao || 'Não identificada')}</td>
    </tr>
  `).join('');

  statusEl.textContent = `Mostrando ${visitas.length} visita(s).`;
  visitasTable.style.display = 'table';
}

// Carrego as visitas assim que a página administrativa abre.
async function carregarVisitas() {
  try {
    const visitas = await buscarVisitas();
    exibirVisitas(visitas);
  } catch (erro) {
    exibirErro('Erro ao carregar visitas. Configure e habilite a Neon Data API.');
    console.error('Erro ao carregar visitas:', erro);
  }
}

window.addEventListener('load', carregarVisitas);

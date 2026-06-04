const neonDataApiUrl = window.NEON_DATA_API_URL || 'https://ep-aged-band-ac33aasw.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1';
const neonAuthUrl = window.NEON_AUTH_URL || 'https://ep-aged-band-ac33aasw.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
const neonDataApiToken = window.NEON_DATA_API_TOKEN || '';
const backendApiUrl = window.PORTFOLIO_API_URL || '';

const urlApiVisitas = (() => {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const rodandoLocalmente = window.location.protocol === 'file:' || isLocalhost;

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

  return null;
})();

const statusEl = document.getElementById('admin-status');
const visitasTable = document.getElementById('visitas-table');
const visitasBody = visitasTable.querySelector('tbody');

function textoSeguro(valor) {
  return String(valor || '-')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

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

  const autenticar = (endpoint, dados) => fetch(`${neonAuthUrl}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  let respostaAuth = await autenticar(credenciaisSalvas ? 'sign-in/email' : 'sign-up/email', credenciais);

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
    'Content-Type': 'application/json'
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
  if (!urlApiVisitas) {
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

function exibirErro(mensagem) {
  statusEl.textContent = mensagem;
  visitasTable.style.display = 'none';
}

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
      <td>${textoSeguro(visita.ip)}</td>
      <td>${textoSeguro(visita.navegador)}</td>
      <td>${textoSeguro(visita.criado_em)}</td>
    </tr>
  `).join('');

  statusEl.textContent = `Mostrando ${visitas.length} visita(s).`;
  visitasTable.style.display = 'table';
}

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

// Defina aqui a URL pública do seu backend Render ou serviço similar.
// Exemplo:
// const backendApiUrl = 'https://seu-backend-no-render.onrender.com';
const backendApiUrl = 'https://portifolio-vry2.onrender.com';

const backendBaseUrl = backendApiUrl ? backendApiUrl.replace(/\/$/, '') : '';
const urlApiVisitas = backendBaseUrl ? `${backendBaseUrl}/api/visitas` : null;
const statusEl = document.getElementById('admin-status');
const visitasTable = document.getElementById('visitas-table');
const visitasBody = visitasTable.querySelector('tbody');

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
      <td>${visita.nome || '-'}</td>
      <td>${visita.empresa || '-'}</td>
      <td>${visita.data_visita || '-'}</td>
      <td>${visita.ip || '-'}</td>
      <td>${visita.navegador || '-'}</td>
      <td>${visita.criado_em || '-'}</td>
    </tr>
  `).join('');

  statusEl.textContent = `Mostrando ${visitas.length} visita(s).`;
  visitasTable.style.display = 'table';
}

async function carregarVisitas() {
  if (!urlApiVisitas) {
    exibirErro('Defina a URL do backend em scripts/admin.js para carregar as visitas.');
    return;
  }

  try {
    const resposta = await fetch(urlApiVisitas);

    if (!resposta.ok) {
      throw new Error(`Erro ${resposta.status}`);
    }

    const visitas = await resposta.json();
    exibirVisitas(visitas);
  } catch (erro) {
    exibirErro('Erro ao carregar visitas. Verifique se o backend está online e se a URL está correta.');
    console.error('Erro ao carregar visitas:', erro);
  }
}

window.addEventListener('load', carregarVisitas);

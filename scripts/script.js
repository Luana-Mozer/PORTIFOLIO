const botao = document.getElementById('botao-tema');
const body = document.body;
const menuBotoes = document.querySelectorAll('#menu .link[data-view]');
const paineis = document.querySelectorAll('.painel-conteudo');
const experiencias = [
  {
    periodo: '06/2012 - 12/2012',
    marco: '2012',
    empresa: 'ThyssenKrupp Elevadores',
    logo: 'TK',
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Thyssenkrupp_AG_Logo_2015.svg/120px-Thyssenkrupp_AG_Logo_2015.svg.png',
    corLogo: '#003c7d',
    cargo: 'Aprendiz',
    descricao: 'Atuação como jovem aprendiz em rotinas administrativas e suporte ao departamento de TI.',
    atividades: [
      'Auxílio administrativo e organização de arquivos.',
      'Apoio em atividades do departamento de TI.',
      'Aprendizado prático em ambiente corporativo.'
    ]
  },
  {
    periodo: '03/2014 - 01/2015',
    marco: '2014',
    empresa: 'A&C Contact Center',
    logo: 'AC',
    logoImagem: 'https://www.aec.com.br/wp-content/themes/aec/dist/img/logotipo.webp',
    logoOpacidade: 0.55,
    corLogo: '#0b7285',
    cargo: 'Atendente',
    descricao: 'Atendimento ao público para serviços de saúde da Unimed BH.',
    atividades: [
      'Agendamento de consultas.',
      'Agendamento de exames.',
      'Atendimento e orientação aos beneficiários.'
    ]
  },
  {
    periodo: '05/2015 - 01/2017',
    marco: '2015',
    empresa: 'Drogaria Araújo',
    logo: 'DA',
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Drogaria_Araujo_Logo.jpg',
    corLogo: '#1f7a3a',
    cargo: 'Auxiliar de Logística Sênior',
    descricao: 'Atuação em separação, registro, expedição de mercadorias e apoio a vendas internas.',
    atividades: [
      'Separação de mercadorias.',
      'Registro de saída no sistema.',
      'Criação de rotas para motociclistas e apoio em expedição.'
    ]
  },
  {
    periodo: '04/2017 - 11/2018',
    marco: '2017',
    empresa: 'Ricardo Eletro',
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
    periodo: '01/2019 - 12/2022',
    marco: '2019',
    empresa: 'Uber',
    logo: 'UB',
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg',
    corLogo: '#111111',
    cargo: 'Motorista',
    descricao: 'Atuação como motorista de aplicativo e manobrista.',
    atividades: [
      'Transporte de passageiros por aplicativo.',
      'Atendimento direto aos clientes.',
      'Manobra e cuidado com veículos.'
    ]
  },
  {
    periodo: '02/2023 - 08/2023',
    marco: '2023',
    empresa: 'Mercado Livre',
    logo: 'ML',
    logoImagem: 'https://bring.com.br/blog/wp-content/uploads/2018/05/Mercado-Livre-logo-300x84.png',
    logoTamanho: 'contain',
    corLogo: '#816400',
    cargo: 'Representante de Envios',
    descricao: 'Atuação em processos de separação, registro e expedição de mercadorias.',
    atividades: [
      'Separação e registro de mercadorias.',
      'Expedição de pedidos.',
      'Auxílio no controle de perdas e eventos da empresa.'
    ]
  },
  {
    periodo: '04/2024 - 12/2024',
    marco: '2024',
    empresa: 'Estapar',
    logo: 'ES',
    logoImagem: 'https://polijunior.com.br/wp-content/uploads/2024/03/estapar-case.jpeg',
    logo: 'ES',
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
    periodo: '04/2025 - Atualmente',
    marco: 'Atual',
    empresa: 'Atento',
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
  }
];
let experienciaAtual = experiencias.length - 1;
let experienciaAnimando = false;

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
}

function trocarExperiencia(direcao, indiceDestino = null) {
  if (experienciaAnimando) {
    return;
  }

  const card = document.querySelector('.experiencia-conteudo');
  const botoes = document.querySelectorAll('.experiencia-seta');

  if (!card) {
    return;
  }

  experienciaAnimando = true;
  botoes.forEach((botaoSeta) => {
    botaoSeta.disabled = true;
  });

  const saindo = direcao === 'proxima' ? 'pagina-saindo-proxima' : 'pagina-saindo-anterior';
  const entrando = direcao === 'proxima' ? 'pagina-entrando-proxima' : 'pagina-entrando-anterior';
  card.classList.add(saindo);

  setTimeout(() => {
    experienciaAtual = indiceDestino ?? (
      direcao === 'proxima'
        ? (experienciaAtual + 1) % experiencias.length
        : (experienciaAtual - 1 + experiencias.length) % experiencias.length
    );

    exibirExperiencia(experienciaAtual);
    card.classList.remove(saindo);
    card.classList.add(entrando);
  }, 260);

  setTimeout(() => {
    card.classList.remove(entrando);
    botoes.forEach((botaoSeta) => {
      botaoSeta.disabled = false;
    });
    experienciaAnimando = false;
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

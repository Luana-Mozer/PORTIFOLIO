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
    logoImagem: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Thyssenkrupp_Elevator_AG_Logo_2021.svg',
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
    logoImagem: 'data:image/png;base64,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',
    logoImagem: null,
    logoTexto: 'estapar',
    logoTextoCor: '#145a32',
    logoTamanho: 'contain',
    logoOpacidade: 1,
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

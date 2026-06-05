# Portfólio Luana Mozer

Este é o meu portfólio profissional, criado para apresentar minha trajetória, meus projetos e meu direcionamento atual na área de tecnologia. A proposta do site é funcionar como uma vitrine prática: quem acessa consegue conhecer minha história, minhas experiências, meus estudos, meus projetos e também interagir com recursos que eu mesma fui implementando para deixar o portfólio mais completo.

🔗 Acesse: https://luana-mozer.github.io/PORTIFOLIO/

## Objetivo do projeto

Eu criei este portfólio para reunir em um só lugar:

- minha apresentação profissional;
- minha experiência em atendimento, logística, backoffice e tecnologia;
- meus projetos publicados;
- minhas áreas de foco: automação de processos, MySQL, n8n, Python, agentes de IA e chatbots;
- um formulário de acesso com registro de visitas;
- uma página administrativa para acompanhar os acessos;
- uma assistente visual chamada Luh, que responde dúvidas sobre mim dentro do site.

## Processo criativo

A ideia foi construir um portfólio que não fosse apenas uma página estática. Eu quis que ele mostrasse um pouco do meu lado visual, mas também minha evolução com lógica, integração, banco de dados e automação.

Primeiro organizei a estrutura principal em HTML, CSS e JavaScript. Depois fui adicionando recursos mais práticos, como troca de tema, navegação por painéis, linha do tempo profissional, formulário de entrada, registro no banco de dados e painel admin.

Mais recentemente, também adicionei a personagem Luh, uma pequena assistente no canto da tela. Ela funciona como um chat de apoio para responder perguntas sobre minha trajetória, minhas experiências e meus focos profissionais.

## Ferramentas e tecnologias usadas

- **HTML5** para a estrutura das páginas.
- **CSS3** para layout, responsividade, tema visual e animações.
- **JavaScript** para interações, validações, chat da Luh e integração com APIs.
- **GitHub Pages** para publicar o front-end.
- **Neon Data API** para gravar e consultar visitas diretamente no banco.
- **Neon Auth** para autenticar chamadas feitas para a Data API.
- **PostgreSQL/Neon** para armazenar as visitas.
- **MySQL** como referência inicial de estudo e estrutura antiga de banco.
- **Font Awesome** para os ícones.
- **localStorage** para salvar preferências e dados locais necessários ao funcionamento.

## Estrutura de pastas

```txt
PORTIFOLIO/
├── .env.example            # Modelo seguro para variáveis locais
├── admin.html              # Página administrativa de visitas
├── index.html              # Página principal do portfólio
├── server.js               # Backend local opcional para testes
├── package.json            # Scripts e dependências Node
├── database/
│   └── schema.sql          # Estrutura e permissões da tabela de visitas
├── Curriculo/
│   └── Luana Mozer Technologia.pdf
├── estilos/
│   └── style.css           # Estilos principais do site
├── imagens/
│   ├── luh-chat-avatar.png         # Avatar original da assistente Luh
│   ├── luh-chat-avatar-recorte.png # Avatar recortado com fundo transparente para o chat
│   └── imagens dos projetos e perfil
└── scripts/
    ├── script.js           # Lógica principal do site
    └── admin.js            # Lógica da página admin
```

## Página principal

O arquivo `index.html` concentra a experiência principal do portfólio. Nele estão:

- popup inicial de acesso;
- ficha com foto, currículo e redes;
- vídeo de apresentação;
- seções de habilidades, formação, cursos e projetos;
- linha do tempo profissional;
- chat da Luh;
- links para currículo, GitHub, LinkedIn e projetos.

## Chat da Luh

O chat da Luh fica no canto direito da tela, com a personagem em PNG transparente para não criar um bloco visual pesado. Em telas com mouse, o balão de convite aparece apenas ao passar o cursor ou focar no avatar. No celular, a janela abre dentro da área visível da tela para manter o campo de pergunta acessível.

Ele responde perguntas sobre:

- minhas experiências;
- automação de processos;
- MySQL;
- n8n;
- Python;
- agentes de IA;
- chatbots;
- projetos;
- contato profissional.

As respostas foram escritas com um tom mais natural, como se fosse uma apresentação minha, sem parecer uma lista robótica.

## Registro de visitas

Quando uma pessoa acessa o site, o formulário pede:

- nome;
- empresa.

O botão de acesso só aparece depois que os dois campos são preenchidos. As mensagens do formulário ficam escondidas enquanto não houver erro, evitando uma faixa vazia na tela inicial.

Depois disso, o site registra a visita na tabela `visitas_portfolio`, salvando também:

- `id` gerado automaticamente;
- data da visita;
- horário de criação;
- IP quando disponível;
- navegador quando disponível.

Esses dados ajudam a acompanhar quem acessou o portfólio, sem mostrar informações técnicas no painel.

## Admin

O arquivo `admin.html` é a página administrativa do portfólio.

Ele serve para consultar as visitas registradas no banco. A tabela foi deixada mais limpa e mostra apenas:

- nome;
- empresa;
- data;
- hora.

O `id`, IP e navegador continuam no banco de dados, mas não aparecem na tela do admin para manter a visualização mais objetiva.

## Banco de dados e Neon

O site usa a **Neon Data API** para gravar e ler dados da tabela `visitas_portfolio`.

Também uso **Neon Auth** porque a Data API exige autenticação por JWT. O site cria uma sessão técnica automaticamente para conseguir enviar as informações ao banco de forma autenticada.

As configurações principais ficam no começo de `scripts/script.js` e `scripts/admin.js`:

```js
const neonDataApiUrl = 'https://ep-aged-band-ac33aasw.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1';
const neonAuthUrl = 'https://ep-aged-band-ac33aasw.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
```

As permissões da tabela ficam documentadas em:

```txt
database/schema.sql
```

## Configuração necessária no Neon

Para o site funcionar publicado no GitHub Pages, a Neon Auth precisa aceitar a origem:

```txt
https://luana-mozer.github.io
```

Na Neon Data API, o schema `public` precisa estar exposto e a tabela `visitas_portfolio` precisa ter políticas RLS permitindo `SELECT` e `INSERT` para os papéis usados pela API.

O SQL base está em:

```txt
database/schema.sql
```

Depois de alterar permissões ou tabela no Neon, é importante clicar em **Atualizar cache de esquema** na tela da Data API.

## Como executar localmente

1. Instale as dependências:

```bash
npm install
```

2. Copie o exemplo de variáveis:

```bash
copy .env.example .env
```

3. Ajuste a variável `DATABASE_URL` apenas no arquivo `.env`, se for testar o backend local.

4. Rode:

```bash
npm start
```

5. Acesse:

```txt
http://localhost:3000
```

O site publicado no GitHub Pages usa a Neon Data API diretamente. O `server.js` fica como apoio para testes locais e estudo de backend.

## Publicação

O front-end é publicado pelo GitHub Pages a partir do repositório:

```txt
https://github.com/Luana-Mozer/PORTIFOLIO
```

Sempre que faço alterações, envio para a branch `main` e aguardo o GitHub Pages atualizar. Se a página ainda mostrar uma versão antiga, uso `Ctrl + F5` para limpar o cache do navegador.

## Observações importantes

- Nunca devo colocar senha real do banco no JavaScript do navegador.
- A string `postgresql://...` deve ficar apenas em `.env` ou em ambiente seguro.
- O arquivo `.env` não deve ser commitado.
- O painel admin mostra só as informações necessárias para leitura rápida.
- A estrutura do banco e permissões ficam documentadas em `database/schema.sql`.

## O que aprendi com este projeto

Com este projeto eu pratiquei:

- organização de páginas com HTML;
- criação de layout responsivo;
- uso de CSS com animações e componentes visuais;
- manipulação do DOM com JavaScript;
- integração com API REST;
- autenticação com Neon Auth;
- gravação e leitura de dados no Neon;
- políticas RLS no PostgreSQL;
- criação de uma área administrativa;
- construção de um chatbox contextual para apresentação profissional.

Este portfólio representa minha evolução prática e meu foco atual: usar tecnologia para criar soluções úteis, automatizar processos e construir experiências digitais mais inteligentes.

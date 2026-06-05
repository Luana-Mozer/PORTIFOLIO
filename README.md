# Portfólio Luana Mozer

Este é o meu portfólio profissional. Eu criei este projeto para reunir minha apresentação, minha trajetória, meus estudos, minhas experiências e meus projetos em um só lugar.

A ideia não foi fazer só uma página estática. Eu quis transformar o portfólio em uma experiência mais completa, com registro de visitas, integração com banco de dados, painel administrativo e uma assistente visual chamada Luh para responder dúvidas rápidas sobre mim.

🔗 Acesse: https://luana-mozer.github.io/PORTIFOLIO/

## Objetivo do projeto

O portfólio foi feito para apresentar:

- minha trajetória profissional;
- minha experiência com atendimento, logística, backoffice e tecnologia;
- minha formação em Engenharia de Software;
- meus cursos e habilidades;
- meus projetos publicados;
- meus focos atuais: automação de processos, MySQL, n8n, Python, agentes de IA e chatbots;
- um formulário de entrada com registro de visitantes;
- uma página administrativa para acompanhar os acessos;
- o chat da Luh, que responde perguntas sobre mim dentro do próprio site.

## Processo de criação

Comecei montando a estrutura principal com HTML, CSS e JavaScript. Depois fui adicionando recursos conforme fui estudando e entendendo melhor como deixar o site mais útil.

O projeto hoje tem troca de tema, navegação por abas, linha do tempo profissional, seção de cursos, projetos, integração com banco de dados, painel admin e chatbox.

Também integrei o site com a Neon para registrar quem acessa o portfólio. Assim consigo acompanhar as visitas de forma organizada, sem depender de planilha manual.

## Tecnologias usadas

- **HTML5** para a estrutura das páginas.
- **CSS3** para layout, responsividade, tema visual e animações.
- **JavaScript** para interações, validações, chat da Luh e integração com APIs.
- **GitHub Pages** para publicação do front-end.
- **Neon Data API** para gravar e consultar os acessos.
- **Neon Auth** para autenticar as chamadas feitas para a Data API.
- **PostgreSQL/Neon** para armazenar as visitas.
- **Node.js/Express** como backend local de apoio para testes.
- **Font Awesome** para ícones.
- **localStorage** para guardar preferências e dados técnicos necessários ao funcionamento.

## Estrutura de pastas

```txt
PORTIFOLIO/
├── .env.example            # Modelo de variáveis locais
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
│   ├── luh-chat-avatar.png
│   ├── luh-chat-avatar-recorte.png
│   └── imagens dos projetos e perfil
└── scripts/
    ├── script.js           # Lógica principal do site
    └── admin.js            # Lógica da página admin
```

## Página principal

O arquivo `index.html` concentra a experiência principal do portfólio. Nele ficam:

- popup inicial de acesso;
- ficha com foto, currículo e redes;
- vídeo de apresentação;
- habilidades técnicas e comportamentais;
- formação acadêmica;
- cursos extras;
- experiências profissionais;
- projetos;
- chat da Luh;
- links para currículo, LinkedIn, GitHub e projetos.

## Login e registro de visitas

Ao acessar o site, a pessoa informa:

- nome;
- empresa.

O botão de acesso só aparece quando os dois campos estão preenchidos. Se houver erro, a mensagem aparece apenas no momento necessário, sem deixar uma faixa vazia na tela.

Depois do envio, o site registra a visita na tabela `visitas_portfolio`.

Hoje o banco guarda:

- `id`;
- nome;
- empresa;
- data da visita;
- horário de entrada;
- IP, quando disponível;
- localização aproximada por IP;
- navegador usado.

A localização segue a ideia:

```txt
País, Estado, Cidade
```

Exemplos:

```txt
Brasil, São Paulo, São Paulo
Brasil, Bahia, Salvador
United States, California, Los Angeles
```

O horário é salvo a partir do momento de entrada da pessoa e exibido no painel administrativo no horário de São Paulo.

## Painel administrativo

O arquivo `admin.html` é a área onde acompanho as visitas registradas.

Para deixar a leitura mais simples, a tabela mostra:

- nome;
- empresa;
- data;
- horário de São Paulo;
- localização aproximada.

O `id`, IP e navegador continuam no banco para consulta técnica, mas não aparecem na tabela principal.

## Banco de dados e Neon

O site publicado no GitHub Pages usa a **Neon Data API** para gravar e consultar a tabela `visitas_portfolio`.

Como a Data API precisa de autenticação, também usei a **Neon Auth**. O próprio JavaScript cria ou reaproveita uma sessão técnica para conseguir enviar os dados ao banco.

As configurações principais ficam no começo de `scripts/script.js` e `scripts/admin.js`:

```js
const neonDataApiUrl = 'https://ep-aged-band-ac33aasw.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1';
const neonAuthUrl = 'https://ep-aged-band-ac33aasw.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
```

A estrutura da tabela e as permissões ficam em:

```txt
database/schema.sql
```

## Chat da Luh

A Luh é a assistente visual do portfólio. Ela aparece no cantinho da tela com um avatar em PNG transparente e abre uma janela de chat quando a pessoa clica.

Ela responde perguntas sobre:

- quem sou eu;
- meu currículo;
- experiências profissionais;
- cursos;
- projetos;
- tecnologias;
- automação;
- agentes de IA;
- contato profissional.

As respostas foram escritas com base no conteúdo do site e no meu currículo em PDF. A intenção é ajudar quem acessa a encontrar informações importantes sem precisar procurar em todas as abas.

## Configuração necessária no Neon

Para o site funcionar publicado no GitHub Pages, a Neon Auth precisa aceitar a origem:

```txt
https://luana-mozer.github.io
```

Na Neon Data API, o schema `public` precisa estar exposto e a tabela `visitas_portfolio` precisa permitir `SELECT` e `INSERT` para os papéis usados pela API.

Quando altero a tabela ou permissões, atualizo o cache de schema da Data API para a Neon reconhecer as mudanças.

## Como executar localmente

1. Instale as dependências:

```bash
npm install
```

2. Copie o exemplo de variáveis:

```bash
copy .env.example .env
```

3. Ajuste a variável `DATABASE_URL` no `.env`, se quiser testar com PostgreSQL/Neon.

4. Rode:

```bash
npm start
```

5. Acesse:

```txt
http://localhost:3000
```

O site publicado usa a Neon Data API direto pelo front-end. O `server.js` fica como apoio para testes locais e estudo de backend.

## Publicação

O front-end é publicado pelo GitHub Pages a partir do repositório:

```txt
https://github.com/Luana-Mozer/PORTIFOLIO
```

Quando faço alterações, envio para a branch `main` e aguardo o GitHub Pages atualizar. Se a página ainda mostrar uma versão antiga, faço uma atualização forçada no navegador com `Ctrl + F5`.

## Cuidados importantes

- Não colocar senha real do banco no JavaScript do navegador.
- Manter a string `postgresql://...` apenas no `.env` ou em ambiente seguro.
- Não versionar o arquivo `.env`.
- Usar o painel admin só com as informações necessárias para leitura rápida.
- Manter a estrutura do banco documentada em `database/schema.sql`.

## O que aprendi

Com este projeto eu pratiquei:

- organização de páginas com HTML;
- criação de layout responsivo;
- uso de CSS com animações e componentes visuais;
- manipulação do DOM com JavaScript;
- validação de formulário;
- integração com API REST;
- autenticação com Neon Auth;
- gravação e leitura de dados no Neon;
- uso de PostgreSQL;
- políticas RLS;
- criação de painel administrativo;
- construção de um chatbox contextual.

Este portfólio representa minha evolução prática na tecnologia. Ele junta apresentação profissional, banco de dados, integração com API, automação de registros e uma experiência mais interativa para quem acessa.

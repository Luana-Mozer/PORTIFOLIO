# PORTFÓLIO
## Este é o meu site de portfólio pessoal, desenvolvido para apresentar quem eu sou, minha trajetória, minhas habilidades e meus projetos na área de tecnologia.

<img width="1344" height="601" alt="Image" src="https://github.com/user-attachments/assets/f32e4598-554e-49d4-aea2-75c31d9a55f6" />

# [acesse](https://luana-mozer.github.io/PORTIFOLIO/)

Nele eu organizei:

Minha apresentação pessoal com foto e redes sociais.

Um vídeo de apresentação incorporado do YouTube.

Minhas skills com barras de progresso.

Minha formação acadêmica e cursos complementares.

Meus principais projetos com descrição, links e detalhes expansíveis.

Também implementei design responsivo e modo claro/escuro para melhorar a experiência do usuário.

### 🛠 Como foi criado

Eu desenvolvi o projeto utilizando:

HTML5 para estruturar todo o conteúdo do site.

CSS3 para estilização, layout e responsividade.

JavaScript para interatividade e funcionalidades dinâmicas.

Usei:

Grid e Flexbox para organizar o layout.

Variáveis CSS para controlar as cores.

@media query para tornar o site responsivo.

Font Awesome para os ícones.

localStorage para salvar a preferência de tema do usuário.

### 🚀 Como executar localmente

1. Abra o terminal na pasta do projeto.
2. Execute `npm install`.
3. Copie `src/.env.example` para `.env` e ajuste as variáveis.
4. Execute `npm start` ou `npm run dev`.
5. Abra `http://localhost:3000` no navegador.

> Use `.env` apenas localmente. O arquivo `.env` não deve ser commitado.

### 🌐 GitHub Pages

Este site também funciona como site estático em `https://luana-mozer.github.io/PORTIFOLIO/`.

O GitHub Pages serve apenas o frontend. Para registrar visitas, o backend deve estar hospedado em um serviço Node.js, e o `scripts/script.js` deve apontar para a URL pública do backend.

Você também pode acessar `admin.html` para ver os registros de visitas no navegador.

### 🚀 Deploy recomendado no Render

1. Crie um **Web Service** em https://render.com.
2. Defina o root directory como `src`.
3. Configure:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Defina a variável de ambiente:
   - `DATABASE_URL` = `postgresql://...`
5. Clique em **Deploy**.
6. Copie a URL pública do serviço.
7. No `scripts/script.js`, atualize:
   ```js
   const backendApiUrl = 'https://seu-backend-no-render.onrender.com';
   ```

> O backend já adapta `sslmode` automaticamente para compatibilidade com Neon e Render.

### 📌 Importante

- O GitHub Pages serve apenas o front-end.
- A gravação de visitas só vai funcionar se o backend estiver hospedado e acessível publicamente.
- O banco `DATABASE_URL` não deve ser exposto no site ou em `index.html`.

### 💻 Explicando a codificação

1. Crie uma conta gratuita em um serviço como:
   - Render (render.com)
   - Railway (railway.app)
   - Vercel (vercel.com)
2. Faça deploy do backend `server.js` nesta pasta.
3. Configure as variáveis de ambiente do banco de dados:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
4. O serviço criará uma URL pública para a API, por exemplo `https://meu-backend.onrender.com`.
5. Substitua o valor de `backendApiUrl` em `scripts/script.js` pelo endpoint público do backend.

> Depois disso, você poderá usar `https://luana-mozer.github.io/PORTIFOLIO/` como front-end e registrar visitas em um banco de dados online.


### 📚 O que eu aprendi

Com esse projeto eu aprendi e consolidei:

Estruturação semântica com HTML5.

Uso avançado de CSS (Grid, Flexbox e variáveis).

Criação de layout responsivo.

Manipulação do DOM com JavaScript.

Uso de localStorage para persistência de dados.

Organização de código de forma mais profissional.

Pensar na experiência do usuário (UX).

### 🎯 Conclusão

Esse projeto representa uma evolução importante na minha jornada como desenvolvedora. Eu consegui unir estrutura, design e interatividade em um único site funcional e organizado.

Além de ser meu portfólio, ele também mostra minha capacidade de planejar, desenvolver e finalizar um projeto completo em front-end, aplicando boas práticas e pensando na experiência do usuário.

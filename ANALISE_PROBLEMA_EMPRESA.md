# 🔴 ANÁLISE COMPLETA - VALIDAÇÃO DE EMPRESA

## 📌 RESUMO EXECUTIVO

A mensagem **"Digite uma empresa válida"** está aparecendo mesmo após você deletar as regras porque:

1. ✅ **Você estava tentando deletar a validação ERRADA**
2. ✅ **Há validação em 2 arquivos diferentes** (pode ter deletado em 1 mas não no outro)
3. ✅ **O cache do navegador está salvando o código antigo**

---

## 🔍 LOCALIZAÇÃO EXATA DE TODAS AS VALIDAÇÕES

### 📄 **ARQUIVO 1: `scripts/script.js`**

#### ❌ Linha 271 - Função que NÃO é usada
```javascript
function empresaValida(empresa) {
  const valor = String(empresa || '');
  return valor.length > 1;  // ← Valida se tem mais de 1 caractere
}
```
**Status:** Esta função EXISTE mas **NUNCA É CHAMADA**

#### ❌ Linha 338 - Validação apenas para o botão
```javascript
const empresaValidaParaBotao = campoEmpresaVisitante.value.trim().length > 1;
botaoAcessarSite.hidden = !campoNomeVisitante.value.trim() || !empresaValidaParaBotao;
```
**Status:** Isto apenas **mostra/esconde o botão**, não valida no envio

#### ❌ Linha 317-330 - Função `validarAcesso()`
```javascript
function validarAcesso() {
  const nome = campoNomeVisitante.value.trim().replace(/\s+/g, ' ');
  const empresa = campoEmpresaVisitante.value.trim().replace(/\s+/g, ' ');

  if (!nomeValido(nome)) {
    exibirMensagemLogin('Digite um nome válido', campoNomeVisitante, 'erro');
    return null;
  }

  // ⚠️ EMPRESA NÃO É VALIDADA AQUI!
  exibirMensagemLogin('', null, 'info');
  return { nome, empresa };  // ← Envia empresa sem validar
}
```
**Status:** A variável `empresa` **NÃO é validada** antes de retornar

#### ⚠️ Linha 344-350 - Event Listener que limpa mensagens
```javascript
[campoNomeVisitante, campoEmpresaVisitante].forEach((input) => {
  input?.addEventListener('input', () => {
    input.classList.remove('invalido');
    if (mensagemLogin) {
      mensagemLogin.textContent = '';  // ← Limpa mensagens
    }
    atualizarBotaoAcesso();
  });
});
```
**Status:** Quando você digita, limpa a mensagem anterior (por isso parece desaparecer)

---

### 📄 **ARQUIVO 2: `server.js` (raiz) e `src/server.js` (cópia)**

#### ❌ Linhas 134-137 em `server.js`
```javascript
app.post('/api/visitas', async (req, res) => {
  const nome = String(req.body.nome || '').trim().replace(/\s+/g, ' ');
  const empresa = String(req.body.empresa || '').trim().replace(/\s+/g, ' ');

  if (!nomeValido(nome)) {
    return res.status(400).json({ erro: 'Digite um nome válido' });
  }

  // ⚠️ EMPRESA NÃO É VALIDADA AQUI!
  // Vai direto para INSERT no banco
```
**Status:** Backend **não valida empresa**, apenas nome

#### ⚠️ Linhas 52-65 em `server.js`
```javascript
function textoPareceAleatorio(texto) {
  const textoLimpo = normalizarTexto(texto).replace(/[^a-z0-9 ]/g, '');
  const partes = textoLimpo.split(/\s+/).filter(Boolean);
  const textoSemEspaco = textoLimpo.replace(/\s/g, '');
  const bloqueados = ['alguem', 'teste', 'test', 'xxxx', 'xxx', 'asdf', 'qwerty', 'nome', 'empresa'];
  // ... mais validações ...
}
```
**Status:** Esta função é **usada apenas para validar NOME**, não empresa

---

## 🎯 POR QUE A MENSAGEM CONTINUA APARECENDO

### ❌ Cenário 1: Você deletou em `scripts/script.js` mas não em `src/server.js`
Se o seu servidor está rodando a versão em `src/`, a validação ainda existe lá.

### ❌ Cenário 2: Cache do Navegador
Seu navegador pode estar servindo uma versão antiga do JavaScript em cache.

**Solução:**
```
1. Pressione Ctrl+Shift+Delete
2. Selecione "Todas as datas"
3. Marque "Cookies e dados de site"
4. Clique "Limpar dados"
5. Recarregue a página com Ctrl+F5 (Force refresh)
```

### ❌ Cenário 3: Servidor Remoto (Render/Deploy)
Se deployado em Render/Vercel, o código antigo pode estar em produção.

---

## 📊 MAPA VISUAL DO FLUXO

```
FORMULÁRIO FRONTEND (index.html)
│
├─ Campo: Nome
├─ Campo: Empresa  ← ⚠️ NÃO VALIDADO AQUI
│
▼
[SCRIPT.JS - validarAcesso()]
│
├─ Valida Nome:
│  └─ nomeValido(nome) → Checa letras, comprimento, padrão aleatório
│
├─ Valida Empresa:
│  └─ ❌ NÃO FAZ NADA (empresaValida() não é chamada)
│
▼
POST /api/visitas { nome, empresa }
│
▼
[BACKEND - server.js]
│
├─ Valida Nome:
│  └─ nomeValido(nome) → Retorna erro se inválido
│
├─ Valida Empresa:
│  └─ ❌ NÃO FAZ NADA (empresa é inserida sem validação)
│
▼
INSERT INTO visitas_portfolio
```

---

## ✅ CHECKLIST PARA RESOLVER

- [ ] **1. Limpar Cache do Navegador**
  - Ctrl+Shift+Delete → Limpar dados de site
  - Recarregar com Ctrl+F5

- [ ] **2. Verificar Arquivo Ativo**
  - O servidor está rodando qual arquivo?
  - `server.js` na raiz OU `src/server.js`?

- [ ] **3. Remover Validação de Empresa**
  - Se quer remover completamente:
  - Deletar função `empresaValida()` linha 271 em `scripts/script.js`
  - A validação no botão (linha 338) não causa o erro, mas pode remover também

- [ ] **4. Fazer Deploy**
  - Se usando Render/Vercel, fazer push e deploy novo código
  - Aguardar 1-2 minutos para ativar

- [ ] **5. Testar**
  - Tentar acessar com empresa vazia
  - Tentar acessar com empresa válida
  - Verificar mensagem de erro

---

## 🎯 RESUMO DA SITUAÇÃO REAL

| Validação | Front-end | Backend | Status |
|-----------|-----------|---------|--------|
| **Nome** | ✅ Valida | ✅ Valida | **ATIVA** |
| **Empresa** | ❌ Não valida | ❌ Não valida | **DESATIVA** |
| Mensagem "Digite empresa válida" | ❌ Não gera | - | **Vindo de outro lugar?** |

---

## 🔧 PRÓXIMOS PASSOS

1. **Limpe o cache do navegador AGORA**
2. **Recarregue o site**
3. **Se ainda aparecer a mensagem:**
   - Abra o DevTools (F12)
   - Vá em Console (aba Console)
   - Procure por "erro" ou "empresa" nos logs
   - Tire um screenshot e me mostre
4. **Se for deploy remoto:**
   - Verifique qual arquivo está sendo usado no servidor
   - Faça novo deploy

---

**Análise criada em: 1 de junho de 2026**
**Arquivo do projeto: PORTIFOLIO**

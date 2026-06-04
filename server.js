require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const { Pool: PostgresPool } = require('pg');
const path = require('path');

const app = express();
const porta = Number(process.env.PORT || 3000);
const nomeBanco = process.env.DB_NAME || 'portfolio_acessos_luana';
const postgresUrl = process.env.DATABASE_URL || process.env.DB_URL;
const usandoPostgres = Boolean(postgresUrl && /^postgres(?:ql)?:\/\//i.test(postgresUrl));

let pool;

function adaptarPostgresUrl(url) {
  const valor = String(url || '').trim();
  if (!valor) {
    return valor;
  }

  const temSslMode = /(?:\?|&)sslmode=/i.test(valor);
  const temUseLibpq = /(?:\?|&)uselibpqcompat=true/i.test(valor);
  const separador = valor.includes('?') ? '&' : '?';

  if (temSslMode && !temUseLibpq) {
    return `${valor}${separador}uselibpqcompat=true`;
  }

  if (!temSslMode) {
    return `${valor}${separador}sslmode=require&uselibpqcompat=true`;
  }

  return valor;
}

function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

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

function nomeValido(nome) {
  const valor = String(nome || '').trim().replace(/\s+/g, ' ');
  const partes = valor.split(' ');
  const somenteLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ' ]+$/.test(valor);

  return somenteLetras
    && partes.length >= 2
    && partes.every((parte) => parte.length >= 2)
    && valor.length <= 80
    && !textoPareceAleatorio(valor);
}

function empresaValida(empresa) {
  // Empresa deve ter pelo menos 2 caracteres
  const valor = String(empresa || '').trim();
  return valor.length >= 2;
}

async function prepararBanco() {
  if (usandoPostgres) {
    pool = new PostgresPool({
      connectionString: adaptarPostgresUrl(postgresUrl),
      ssl: { rejectUnauthorized: false }
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitas_portfolio (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(80) NOT NULL,
        empresa VARCHAR(100) NOT NULL,
        data_visita DATE NOT NULL,
        ip VARCHAR(45) NULL,
        navegador VARCHAR(255) NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return;
  }

  const conexao = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  await conexao.query(`CREATE DATABASE IF NOT EXISTS \`${nomeBanco}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conexao.end();

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: nomeBanco,
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitas_portfolio (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      nome VARCHAR(80) NOT NULL,
      empresa VARCHAR(100) NOT NULL,
      data_visita DATE NOT NULL,
      ip VARCHAR(45) NULL,
      navegador VARCHAR(255) NULL,
      criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);
}

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});
app.use(express.static(__dirname));

app.get('/api/health', async (_req, res) => {
  try {
    if (usandoPostgres) {
      await pool.query('SELECT 1');
    } else {
      await pool.query('SELECT 1');
    }

    return res.json({ ok: true, banco: usandoPostgres ? 'postgres' : 'mysql' });
  } catch (erro) {
    console.error('Erro no health check:', erro);
    return res.status(500).json({ ok: false, erro: 'Banco indisponivel' });
  }
});

app.post('/api/visitas', async (req, res) => {
  const nome = String(req.body.nome || '').trim().replace(/\s+/g, ' ');
  const empresa = String(req.body.empresa || '').trim().replace(/\s+/g, ' ');

  if (!nomeValido(nome)) {
    return res.status(400).json({ erro: 'Digite um nome válido' });
  }

  if (!empresaValida(empresa)) {
    return res.status(400).json({ erro: 'Digite uma empresa válida' });
  }

  try {
    if (usandoPostgres) {
      await pool.query(
        'INSERT INTO visitas_portfolio (nome, empresa, data_visita, ip, navegador) VALUES ($1, $2, CURRENT_DATE, $3, $4)',
        [nome, empresa, req.ip, req.get('user-agent') || null]
      );
    } else {
      await pool.execute(
        'INSERT INTO visitas_portfolio (nome, empresa, data_visita, ip, navegador) VALUES (?, ?, CURDATE(), ?, ?)',
        [nome, empresa, req.ip, req.get('user-agent') || null]
      );
    }

    return res.status(201).json({ ok: true });
  } catch (erro) {
    console.error('Erro ao salvar visita:', erro);
    return res.status(500).json({ erro: 'Nao foi possivel salvar a visita' });
  }
});

app.get('/api/visitas', async (_req, res) => {
  try {
    if (usandoPostgres) {
      const resultado = await pool.query(
        'SELECT id, nome, empresa, TO_CHAR(data_visita, \'DD/MM/YYYY\') AS data_visita, ip, navegador, criado_em FROM visitas_portfolio ORDER BY criado_em DESC'
      );
      return res.json(resultado.rows);
    }

    const [linhas] = await pool.query(
      'SELECT id, nome, empresa, DATE_FORMAT(data_visita, "%d/%m/%Y") AS data_visita, ip, navegador, criado_em FROM visitas_portfolio ORDER BY criado_em DESC'
    );

    return res.json(linhas);
  } catch (erro) {
    console.error('Erro ao listar visitas:', erro);
    return res.status(500).json({ erro: 'Nao foi possivel listar as visitas' });
  }
});

prepararBanco()
  .then(() => {
    app.listen(porta, () => {
      console.log(`Portfolio rodando em http://localhost:${porta}`);
    });
  })
  .catch((erro) => {
    console.error('Nao foi possivel conectar ao banco de dados.');
    if (usandoPostgres) {
      console.error('Verifique a variável DATABASE_URL para o PostgreSQL.');
    } else {
      console.error('Verifique as variáveis DB_HOST, DB_USER, DB_PASSWORD e DB_NAME.');
    }
    console.error(erro);
    process.exit(1);
  });

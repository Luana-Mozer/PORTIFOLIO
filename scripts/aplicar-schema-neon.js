require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

if (!connectionString) {
  throw new Error('Defina DATABASE_URL no arquivo .env antes de aplicar o schema.');
}

async function aplicarSchema() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const schema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
    await client.query(schema);
    await client.query('SELECT pg_notify($1, $2)', ['pgrst', 'reload schema']);
    const permissao = await client.query(`
      SELECT has_table_privilege('authenticated', 'public.visitas_portfolio', 'INSERT') AS pode_inserir
    `);
    if (!permissao.rows[0].pode_inserir) {
      throw new Error('O papel authenticated não recebeu permissão de INSERT.');
    }
    console.log('Schema de visitas aplicado com sucesso.');
  } finally {
    await client.end();
  }
}

aplicarSchema().catch((erro) => {
  console.error('Não foi possível aplicar o schema:', erro.message);
  process.exitCode = 1;
});

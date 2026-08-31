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
    console.log('Schema de visitas aplicado com sucesso.');
  } finally {
    await client.end();
  }
}

aplicarSchema().catch((erro) => {
  console.error('Não foi possível aplicar o schema:', erro.message);
  process.exitCode = 1;
});

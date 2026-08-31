// Configuracao publica do front-end.
// Coloque aqui a URL do backend publicado, nunca a URL/senha do PostgreSQL.
// Importante: DATABASE_URL é a conexão privada do PostgreSQL/Neon, usada no backend.
// O front-end NÃO deve usar essa URL; ele precisa de endpoints da Neon Data API e Neon Auth.
window.NEON_DATA_API_URL = window.NEON_DATA_API_URL || 'https://ep-aged-band-ac33aasw.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1';
window.NEON_AUTH_URL = window.NEON_AUTH_URL || 'https://ep-aged-band-ac33aasw.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
window.NEON_DATA_API_TOKEN = window.NEON_DATA_API_TOKEN || '';
window.PORTFOLIO_API_URL = window.PORTFOLIO_API_URL || '';

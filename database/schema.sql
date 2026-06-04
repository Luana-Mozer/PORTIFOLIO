-- Estrutura principal do banco que eu uso para registrar as visitas do portfólio.
-- A tabela guarda dados úteis para o painel admin e para auditoria básica.

CREATE TABLE IF NOT EXISTS public.visitas_portfolio (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  empresa VARCHAR(100) NOT NULL,
  data_visita DATE NOT NULL,
  ip VARCHAR(45) NULL,
  navegador VARCHAR(255) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.visitas_portfolio ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anonymous;
GRANT SELECT, INSERT ON public.visitas_portfolio TO anonymous;
GRANT USAGE, SELECT ON SEQUENCE public.visitas_portfolio_id_seq TO anonymous;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.visitas_portfolio TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.visitas_portfolio_id_seq TO authenticated;

DROP POLICY IF EXISTS "Permitir leitura publica de visitas" ON public.visitas_portfolio;
DROP POLICY IF EXISTS "Permitir cadastro publico de visitas" ON public.visitas_portfolio;
DROP POLICY IF EXISTS "Permitir leitura autenticada de visitas" ON public.visitas_portfolio;
DROP POLICY IF EXISTS "Permitir cadastro autenticado de visitas" ON public.visitas_portfolio;

CREATE POLICY "Permitir leitura publica de visitas"
ON public.visitas_portfolio
FOR SELECT
TO anonymous
USING (true);

CREATE POLICY "Permitir cadastro publico de visitas"
ON public.visitas_portfolio
FOR INSERT
TO anonymous
WITH CHECK (
  length(trim(nome)) >= 2
  AND length(trim(nome)) <= 80
  AND length(trim(empresa)) >= 2
  AND length(trim(empresa)) <= 100
);

CREATE POLICY "Permitir leitura autenticada de visitas"
ON public.visitas_portfolio
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir cadastro autenticado de visitas"
ON public.visitas_portfolio
FOR INSERT
TO authenticated
WITH CHECK (
  length(trim(nome)) >= 2
  AND length(trim(nome)) <= 80
  AND length(trim(empresa)) >= 2
  AND length(trim(empresa)) <= 100
);

CREATE DATABASE IF NOT EXISTS portfolio_acessos_luana
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portfolio_acessos_luana;

CREATE TABLE IF NOT EXISTS visitas_portfolio (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(80) NOT NULL,
  empresa VARCHAR(100) NOT NULL,
  data_visita DATE NOT NULL,
  ip VARCHAR(45) NULL,
  navegador VARCHAR(255) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

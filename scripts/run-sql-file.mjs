// Executa um arquivo .sql inteiro contra o Postgres via conexão direta.
// Uso: node scripts/run-sql-file.mjs <caminho-do-arquivo.sql> "<connection-string>"
import { readFileSync } from "node:fs";
import pg from "pg";

const [, , filePath, connectionString] = process.argv;

if (!filePath || !connectionString) {
  console.error("Uso: node scripts/run-sql-file.mjs <arquivo.sql> <connection-string>");
  process.exit(1);
}

const sql = readFileSync(filePath, "utf8");
const client = new pg.Client({ connectionString });

try {
  await client.connect();
  await client.query(sql);
  console.log(`OK: ${filePath} executado com sucesso.`);
} catch (error) {
  console.error(`Erro ao executar ${filePath}:`, error.message);
  process.exit(1);
} finally {
  await client.end();
}

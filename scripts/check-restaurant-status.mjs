import pg from "pg";
const client = new pg.Client({ connectionString: process.argv[2] });
await client.connect();
const { rows } = await client.query(
  "select name, slug, status, deleted_at, festival_id from restaurants order by display_order",
);
console.table(rows);
await client.end();

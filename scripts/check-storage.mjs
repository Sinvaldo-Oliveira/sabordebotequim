import pg from "pg";
const client = new pg.Client({ connectionString: process.argv[2] });
await client.connect();
const { rows } = await client.query("select id, public, file_size_limit from storage.buckets");
console.table(rows);
const { rows: policies } = await client.query(
  "select policyname from pg_policies where tablename = 'objects' and schemaname='storage'",
);
console.table(policies);
await client.end();

import pg from "pg";
const client = new pg.Client({ connectionString: process.argv[2] });
await client.connect();

const { rows: bucket } = await client.query(
  "select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'restaurant-media'",
);
console.log("Bucket:", bucket);

const { rows: policies } = await client.query(`
  select policyname, cmd, roles, qual, with_check
  from pg_policies
  where tablename = 'objects' and schemaname = 'storage'
  order by policyname
`);
console.log("\nPolicies:");
for (const p of policies) {
  console.log(`\n[${p.policyname}] cmd=${p.cmd} roles=${p.roles}`);
  console.log("  using:", p.qual);
  console.log("  with_check:", p.with_check);
}
await client.end();

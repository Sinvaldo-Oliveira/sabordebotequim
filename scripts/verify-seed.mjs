import pg from "pg";

const client = new pg.Client({ connectionString: process.argv[2] });
await client.connect();

const queries = [
  ["festivals", "select count(*) from festivals"],
  ["voting_categories", "select count(*) from voting_categories"],
  ["restaurants", "select count(*) from restaurants"],
  ["dishes", "select count(*) from dishes"],
  ["sponsors", "select count(*) from sponsors"],
  ["landing_sections", "select count(*) from landing_sections"],
  ["analytics_events", "select count(*) from analytics_events"],
  ["votes", "select count(*) from votes"],
  ["votes by status", "select status, count(*) from votes group by status order by 1"],
  ["profiles", "select role, count(*) from profiles group by role order by 1"],
  ["restaurants with owner", "select name, owner_user_id is not null as has_owner from restaurants order by display_order"],
];

for (const [label, sql] of queries) {
  const { rows } = await client.query(sql);
  console.log(`\n-- ${label} --`);
  console.table(rows);
}

await client.end();

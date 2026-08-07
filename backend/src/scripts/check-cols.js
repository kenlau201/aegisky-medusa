const {Client} = require('pg');
const c = new Client({connectionString: 'postgresql://medusa:medusa_password@localhost:5434/medusa-aegisky'});
(async() => {
  await c.connect();
  const r = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='aegisky_categories' ORDER BY ordinal_position");
  console.log(r.rows.map(x => x.column_name).join(', '));
  await c.end();
})();

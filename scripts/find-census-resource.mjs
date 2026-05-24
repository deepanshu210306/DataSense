const key = process.env.DATA_GOV_IN_API_KEY;
if (!key) {
  console.error("Set DATA_GOV_IN_API_KEY");
  process.exit(1);
}

const slugs = [
  "literates-illiterates-census-2011-india",
  "disabled-population-census-2011-india",
];

async function testId(id) {
  const u = `https://api.data.gov.in/resource/${id}?api-key=${key}&format=json&limit=1`;
  const j = await (await fetch(u, { signal: AbortSignal.timeout(20000) })).json();
  if (j.records?.length) {
    console.log("WORKS", id, j.title, Object.keys(j.records[0]).slice(0, 6));
    return true;
  }
  if (j.title) console.log("meta only", id, j.title, j.message || j.status);
  return false;
}

for (const slug of slugs) {
  console.log("\n===", slug, "===");
  const html = await (
    await fetch(`https://www.data.gov.in/resource/${slug}`, {
      signal: AbortSignal.timeout(30000),
    })
  ).text();
  const uuids = [
    ...new Set(
      [...html.matchAll(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi)].map(
        (m) => m[0],
      ),
    ),
  ];
  console.log("uuids found", uuids.length);
  for (const id of uuids.slice(0, 12)) {
    await testId(id);
  }
}

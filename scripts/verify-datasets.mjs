/**
 * Verifies that one DATA_GOV_IN_API_KEY can fetch seeded Census datasets.
 * Usage: node --env-file=.env.local scripts/verify-datasets.mjs
 */

const key = process.env.DATA_GOV_IN_API_KEY;
if (!key) {
  console.error("Set DATA_GOV_IN_API_KEY (e.g. load from .env.local).");
  process.exit(1);
}

const DATASETS = {
  primaryAbstract: {
    label: "Census 2011 — Primary Abstract (India)",
    resourceId: "0764657f-00ec-4c6b-9ece-2d7b8a7401fa",
  },
  ageSex: {
    label: "Census 2011 — Population by Age & Sex",
    resourceId: "3fac8061-9b36-418d-a5d5-7cedd300c942",
  },
};

async function verifyDataset(id, config) {
  const url = `https://api.data.gov.in/resource/${config.resourceId}?api-key=${key}&format=json&limit=3`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const body = await res.json();
  const records = body.records ?? [];
  const ok = res.ok && Array.isArray(records) && records.length > 0;
  const sampleCols =
    ok ? Object.keys(records[0]).slice(0, 6).join(", ") : "—";

  return {
    id,
    label: config.label,
    ok,
    httpStatus: res.status,
    rowCount: records.length,
    total: body.total ?? body.count ?? null,
    sampleCols,
    message: body.message ?? body.error ?? null,
  };
}

console.log("Verifying datasets with single DATA_GOV_IN_API_KEY…\n");

let allOk = true;
for (const [id, config] of Object.entries(DATASETS)) {
  try {
    const result = await verifyDataset(id, config);
    allOk = allOk && result.ok;
    const status = result.ok ? "OK" : "FAIL";
    console.log(`[${status}] ${id} — ${result.label}`);
    console.log(
      `       HTTP ${result.httpStatus} | rows ${result.rowCount}${result.total != null ? ` / total ${result.total}` : ""}`,
    );
    if (result.ok) console.log(`       columns: ${result.sampleCols}`);
    if (result.message) console.log(`       note: ${result.message}`);
  } catch (err) {
    allOk = false;
    console.log(`[FAIL] ${id} — ${config.label}`);
    console.log(`       ${err instanceof Error ? err.message : String(err)}`);
  }
  console.log("");
}

console.log(
  allOk
    ? "All datasets reachable with one API key."
    : "Some datasets failed — check resource IDs or key permissions on data.gov.in.",
);
process.exit(allOk ? 0 : 1);

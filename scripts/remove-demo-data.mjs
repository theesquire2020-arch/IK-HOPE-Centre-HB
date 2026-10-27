import "dotenv/config";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const removed = await client.query(
      "DELETE FROM transactions WHERE donation_id IN (SELECT id FROM donations WHERE receipt_code LIKE 'IKH-SEED%' OR provider_ref LIKE 'DEMO-%')",
    );
    const donations = await client.query(
      "DELETE FROM donations WHERE receipt_code LIKE 'IKH-SEED%' OR provider_ref LIKE 'DEMO-%'",
    );
    const campaigns = await client.query(
      "DELETE FROM campaigns WHERE slug IN ('term-1-school-fees', 'kitchen-and-dining-hall', 'mobile-health-checks', 'solar-power-for-the-center') AND NOT EXISTS (SELECT 1 FROM donations WHERE donations.campaign_id = campaigns.id)",
    );
    await client.query("COMMIT");
    console.log(
      `Removed ${donations.rowCount} demo donations, ${removed.rowCount} related transactions, and ${campaigns.rowCount} unused demo campaigns.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}

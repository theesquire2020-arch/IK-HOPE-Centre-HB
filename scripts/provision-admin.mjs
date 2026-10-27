import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;
const required = ["DATABASE_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_TOTP_SECRET"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
if (process.env.ADMIN_PASSWORD.length < 16) {
  throw new Error("ADMIN_PASSWORD must be at least 16 characters");
}
if (!/^[A-Z2-7]{16,}$/.test(process.env.ADMIN_TOTP_SECRET)) {
  throw new Error("ADMIN_TOTP_SECRET must be a Base32 secret of at least 16 characters");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const existing = await pool.query("SELECT id FROM admins WHERE email = $1", [email]);
  if (existing.rowCount) throw new Error(`An admin account already exists for ${email}`);

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await pool.query(
    "INSERT INTO admins (email, name, password_hash, totp_secret, role) VALUES ($1, $2, $3, $4, 'admin')",
    [email, process.env.ADMIN_NAME || "IK Hope Centre Admin", passwordHash, process.env.ADMIN_TOTP_SECRET],
  );
  console.log(`Admin account created for ${email}`);
} finally {
  await pool.end();
}

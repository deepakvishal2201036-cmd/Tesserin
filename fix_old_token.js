const crypto = require("crypto");
const rawKey = "test_token";
const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
const uuid = crypto.randomUUID();
const now = new Date().toISOString();
const sql = `INSERT INTO api_keys (id, name, key_hash, prefix, permissions, created_at, expires_at) VALUES ('${uuid}', 'Old Cached Token', '${keyHash}', 'test_token', '["*"]', '${now}', null);`;

const { execSync } = require("child_process");
const path = require("path");
const os = require("os");
const dbFile = path.join(os.homedir(), "Library/Application Support/Tesserin", "tesserin.db");
try {
  execSync(`sqlite3 "${dbFile}" "${sql}"`);
  console.log("Old token added back");
} catch(e) {
  console.error("DB error:", e.message);
}

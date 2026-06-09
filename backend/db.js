const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "pharmacy.db");

let _db = null;

async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  _db.run(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patient_name TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      prescription_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS prescription_drugs (
      id TEXT PRIMARY KEY,
      prescription_id TEXT NOT NULL,
      drug_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS interaction_cache (
      drug_key TEXT PRIMARY KEY,
      result_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  persist();
  return _db;
}

function persist() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function query(sql, params = []) {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function run(sql, params = []) {
  _db.run(sql, params);
  persist();
}

module.exports = { getDb, query, run, persist };

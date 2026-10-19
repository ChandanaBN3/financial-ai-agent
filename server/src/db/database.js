import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

export function getDatabasePath() {
  const customPath = process.env.DATABASE_PATH;
  if (customPath) {
    if (path.isAbsolute(customPath)) return customPath;
    return path.resolve(process.cwd(), customPath);
  }
  const defaultDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  return path.join(defaultDir, 'financial_agent.db');
}

export function getDatabase(customPath = null) {
  if (dbInstance) return dbInstance;

  const dbPath = customPath || getDatabasePath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new DatabaseSync(dbPath);

  // Enable WAL mode for better concurrency and foreign keys
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  initSchema(dbInstance);
  return dbInstance;
}

export function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT UNIQUE NOT NULL,
      timestamp TEXT NOT NULL,
      amount REAL NOT NULL,
      merchant TEXT NOT NULL,
      category TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      historical_average REAL NOT NULL,
      risk_score INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      triggered_rules TEXT NOT NULL,
      explanation TEXT NOT NULL,
      status TEXT NOT NULL,
      is_demo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS agent_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT UNIQUE NOT NULL,
      timestamp TEXT NOT NULL,
      task_prompt TEXT NOT NULL,
      workflow_type TEXT NOT NULL,
      mode TEXT NOT NULL,
      status TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      steps_count INTEGER NOT NULL,
      execution_trace TEXT NOT NULL,
      final_synthesis TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS knowledge_docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT NOT NULL,
      last_updated TEXT NOT NULL
    );
  `);
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

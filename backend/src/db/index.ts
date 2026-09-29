import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config/index';
import { logger } from '../utils/logger';

// Ensure data directory exists
const dbDir = path.dirname(config.databasePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.databasePath);

// Enable foreign keys and Write-Ahead Logging for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  logger.info(`Initializing SQLite database at: ${config.databasePath}`);

  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Create Email OTPs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_otps (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL COLLATE NOCASE,
      otp_hash TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      is_used INTEGER DEFAULT 0,
      expires_at TEXT NOT NULL,
      resend_available_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_otps_email ON email_otps(email);
  `);

  // Create User Profiles Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      address_area TEXT NOT NULL,
      society_building TEXT,
      flat_unit TEXT,
      gate_notes TEXT,
      business_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Tasks Catalogue Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      icon_name TEXT NOT NULL,
      sub_services TEXT NOT NULL,
      is_coming_soon INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
  `);

  // Create User Task Requests Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      service_title TEXT NOT NULL,
      sub_services TEXT NOT NULL,
      urgency TEXT NOT NULL,
      lifestyle_manager TEXT DEFAULT 'Pilot LM',
      status TEXT DEFAULT 'In Progress',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_requests_user ON user_requests(user_id);
  `);

  logger.info('Database schema initialized successfully.');
}

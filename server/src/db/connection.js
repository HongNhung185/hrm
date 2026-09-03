const path = require('path');

let DatabaseSync;
try {
  // node:sqlite chỉ có sẵn từ Node.js >= 22.5.
  // Từ 22.13/23.4 trở đi không cần cờ --experimental-sqlite nữa.
  ({ DatabaseSync } = require('node:sqlite'));
} catch (err) {
  console.error('❌ Không thể tải module "node:sqlite".');
  console.error('   Yêu cầu Node.js >= 22.5 (khuyến nghị >= 22.13 để không cần cờ --experimental-sqlite).');
  console.error(`   Phiên bản Node.js hiện tại: ${process.version}`);
  process.exit(1);
}

const dbPath = path.join(__dirname, '../../hrm.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

const query = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
};

const queryOne = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
};

const run = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
};

const exec = (sql) => {
  return db.exec(sql);
};

// Đóng kết nối DB gọn gàng - được gọi từ index.js khi server tắt (Ctrl+C, kill, v.v.)
const closeDb = () => {
  try {
    db.close();
    console.log('🔒 Đã đóng kết nối SQLite.');
  } catch (err) {
    // db có thể đã đóng rồi, bỏ qua
  }
};

module.exports = {
  db,
  query,
  queryOne,
  run,
  exec,
  closeDb
};
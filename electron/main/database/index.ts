// SQLite相关导入 - 已注释
// import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import mysql from 'mysql2/promise';

// MySQL数据库连接
let connection: mysql.Connection | null = null;

// SQLite数据库连接 - 已注释
// let db: Database.Database | null = null;

/**
 * 连接到MySQL数据库
 * @param config 数据库配置
 * @returns 是否连接成功
 */
export async function connectToDatabase(config: {
  mysql?: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  database: string;
}) {
  try {
    // MySQL连接配置
    if (config.mysql) {
      connection = await mysql.createConnection({
        host: config.mysql.host,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database,
        charset: 'utf8mb4'
      });

      console.log('MySQL数据库连接成功');

      // 初始化数据库表
      await initDatabase();

      return true;
    }

    throw new Error('MySQL配置未找到');

    /* SQLite连接代码 - 已注释
    // 确定数据库文件路径
    const dbPath = path.join(
      app.isPackaged ? process.resourcesPath : path.join(process.cwd()),
      'data',
      `${config.database}.db`
    );

    // 确保数据目录存在
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // 创建数据库连接
    db = new Database(dbPath, { verbose: console.log });

    // 启用外键约束
    db.pragma('foreign_keys = ON');

    console.log('SQLite数据库连接成功:', dbPath);

    // 初始化数据库表
    initDatabase();

    return true;
    */
  } catch (error) {
    console.error('MySQL数据库连接失败:', error);
    return false;
  }
}

/**
 * 获取数据库连接
 * @returns MySQL数据库连接对象
 */
export function getConnection() {
  if (!connection) {
    throw new Error('数据库未连接');
  }
  return connection;
}

/* SQLite获取连接函数 - 已注释
export function getConnection() {
  if (!db) {
    throw new Error('数据库未连接');
  }
  return db;
}
*/

/**
 * 关闭数据库连接
 */
export async function closeConnection() {
  if (connection) {
    try {
      await connection.end();
      connection = null;
      console.log('MySQL数据库连接已关闭');
    } catch (error) {
      console.error('关闭MySQL数据库连接失败:', error);
    }
  }

  /* SQLite关闭连接代码 - 已注释
  if (db) {
    try {
      db.close();
      db = null;
      console.log('SQLite数据库连接已关闭');
    } catch (error) {
      console.error('关闭SQLite数据库连接失败:', error);
    }
  }
  */
}

/**
 * 执行SQL查询
 * @param sql SQL语句
 * @param params 参数
 * @returns 查询结果
 */
export async function query(sql: string, params: any[] = []) {
  const conn = getConnection();
  try {
    // MySQL查询
    const [rows, fields] = await conn.execute(sql, params);

    // 判断SQL类型
    const sqlLower = sql.trim().toLowerCase();
    if (sqlLower.startsWith('select') || sqlLower.startsWith('show') || sqlLower.startsWith('describe')) {
      // 查询操作
      return rows;
    } else if (sqlLower.startsWith('insert')) {
      // 插入操作
      const result = rows as mysql.ResultSetHeader;
      return { insertId: Number(result.insertId), affectedRows: result.affectedRows };
    } else {
      // 更新或删除操作
      const result = rows as mysql.ResultSetHeader;
      return { affectedRows: result.affectedRows };
    }

    /* SQLite查询代码 - 已注释
    // 判断SQL类型
    const sqlLower = sql.trim().toLowerCase();
    if (sqlLower.startsWith('select') || sqlLower.startsWith('pragma')) {
      // 查询操作
      const stmt = conn.prepare(sql);
      return stmt.all(params);
    } else if (sqlLower.startsWith('insert')) {
      // 插入操作
      const stmt = conn.prepare(sql);
      const result = stmt.run(params);
      return { insertId: Number(result.lastInsertRowid), affectedRows: result.changes };
    } else {
      // 更新或删除操作
      const stmt = conn.prepare(sql);
      const result = stmt.run(params);
      return { affectedRows: result.changes };
    }
    */
  } catch (error) {
    console.error('SQL查询失败:', error);
    throw error;
  }
}

/**
 * 初始化数据库表
 */
async function initDatabase() {
  const conn = getConnection();

  try {
    // 创建生产线信息表 (MySQL)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS production_lines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        line_number VARCHAR(50) NOT NULL UNIQUE,
        line_name VARCHAR(100) NOT NULL,
        line_type ENUM('车身', '涂装', '总装') NOT NULL,
        shift INT NOT NULL DEFAULT 0,
        speed DECIMAL(10,2) NOT NULL DEFAULT 0,
        efficiency DECIMAL(5,2) NOT NULL DEFAULT 0,
        \`group\` INT,
        flow_code VARCHAR(50),
        abbreviation VARCHAR(20),
        operator_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    /* SQLite创建生产线信息表 - 已注释
    conn.exec(\`
      CREATE TABLE IF NOT EXISTS production_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        line_number TEXT NOT NULL UNIQUE,
        line_name TEXT NOT NULL,
        line_type TEXT NOT NULL CHECK(line_type IN ('车身', '涂装', '总装')),
        shift INTEGER NOT NULL DEFAULT 0,
        speed REAL NOT NULL DEFAULT 0,
        efficiency REAL NOT NULL DEFAULT 0,
        "group" INTEGER,
        flow_code TEXT,
        abbreviation TEXT,
        operator_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    */

    // 创建生产线特殊信息表 (MySQL)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS production_line_special_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        production_line_id INT NOT NULL,
        code_type ENUM('WhiteBodyCode', 'ColorCode') NOT NULL,
        code_value VARCHAR(100) NOT NULL,
        line_type ENUM('车身', '涂装', '总装') NOT NULL,
        operator_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (production_line_id) REFERENCES production_lines(id) ON DELETE CASCADE,
        UNIQUE KEY unique_code (code_type, code_value, line_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    /* SQLite创建生产线特殊信息表 - 已注释
    conn.exec(\`
      CREATE TABLE IF NOT EXISTS production_line_special_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        production_line_id INTEGER NOT NULL,
        code_type TEXT NOT NULL CHECK(code_type IN ('WhiteBodyCode', 'ColorCode')),
        code_value TEXT NOT NULL,
        line_type TEXT NOT NULL CHECK(line_type IN ('车身', '涂装', '总装')),
        operator_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (production_line_id) REFERENCES production_lines(id) ON DELETE CASCADE,
        UNIQUE (code_type, code_value, line_type)
      )
    \`);
    */

    // 创建特殊发动机表 (MySQL)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS special_engines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        engine_code VARCHAR(50) NOT NULL UNIQUE,
        gear VARCHAR(20) NOT NULL,
        engine_name VARCHAR(100) NOT NULL,
        operator_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 创建计划颜色表 (MySQL)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS planned_colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        color_code VARCHAR(50) NOT NULL UNIQUE,
        color_name VARCHAR(100) NOT NULL,
        top_coat_color VARCHAR(100),
        operator_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    /* SQLite创建特殊发动机表 - 已注释
    conn.exec(\`
      CREATE TABLE IF NOT EXISTS special_engines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        engine_code TEXT NOT NULL UNIQUE,
        gear TEXT NOT NULL,
        engine_name TEXT NOT NULL,
        operator_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);

    // 创建计划颜色表
    conn.exec(\`
      CREATE TABLE IF NOT EXISTS planned_colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        color_code TEXT NOT NULL UNIQUE,
        color_name TEXT NOT NULL,
        top_coat_color TEXT,
        operator_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    */

    console.log('MySQL数据库表初始化完成');

    /* SQLite触发器代码 - 已注释 (MySQL使用ON UPDATE CURRENT_TIMESTAMP)
    // 创建触发器来模拟MySQL的ON UPDATE CURRENT_TIMESTAMP功能
    // 生产线表
    conn.exec(\`
      CREATE TRIGGER IF NOT EXISTS update_production_lines_timestamp
      AFTER UPDATE ON production_lines
      FOR EACH ROW
      BEGIN
        UPDATE production_lines SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    \`);

    // 生产线特殊信息表
    conn.exec(\`
      CREATE TRIGGER IF NOT EXISTS update_production_line_special_info_timestamp
      AFTER UPDATE ON production_line_special_info
      FOR EACH ROW
      BEGIN
        UPDATE production_line_special_info SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    \`);

    // 特殊发动机表
    conn.exec(\`
      CREATE TRIGGER IF NOT EXISTS update_special_engines_timestamp
      AFTER UPDATE ON special_engines
      FOR EACH ROW
      BEGIN
        UPDATE special_engines SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    \`);

    // 计划颜色表
    conn.exec(\`
      CREATE TRIGGER IF NOT EXISTS update_planned_colors_timestamp
      AFTER UPDATE ON planned_colors
      FOR EACH ROW
      BEGIN
        UPDATE planned_colors SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    \`);
    */
  } catch (error) {
    console.error('MySQL数据库表初始化失败:', error);
    throw error;
  }
}
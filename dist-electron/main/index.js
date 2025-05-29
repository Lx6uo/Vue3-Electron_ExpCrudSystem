"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const fs$1 = require("node:fs");
let db = null;
async function connectToDatabase(config) {
  try {
    const dbPath = path.join(
      electron.app.isPackaged ? process.resourcesPath : path.join(process.cwd()),
      "data",
      `${config.database}.db`
    );
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(dbPath, { verbose: console.log });
    db.pragma("foreign_keys = ON");
    console.log("SQLite数据库连接成功:", dbPath);
    initDatabase();
    return true;
  } catch (error) {
    console.error("SQLite数据库连接失败:", error);
    return false;
  }
}
function getConnection() {
  if (!db) {
    throw new Error("数据库未连接");
  }
  return db;
}
async function closeConnection() {
  if (db) {
    try {
      db.close();
      db = null;
      console.log("SQLite数据库连接已关闭");
    } catch (error) {
      console.error("关闭SQLite数据库连接失败:", error);
    }
  }
}
async function query(sql, params = []) {
  const conn = getConnection();
  try {
    const sqlLower = sql.trim().toLowerCase();
    if (sqlLower.startsWith("select") || sqlLower.startsWith("pragma")) {
      const stmt = conn.prepare(sql);
      return stmt.all(params);
    } else if (sqlLower.startsWith("insert")) {
      const stmt = conn.prepare(sql);
      const result = stmt.run(params);
      return { insertId: Number(result.lastInsertRowid), affectedRows: result.changes };
    } else {
      const stmt = conn.prepare(sql);
      const result = stmt.run(params);
      return { affectedRows: result.changes };
    }
  } catch (error) {
    console.error("SQL查询失败:", error);
    throw error;
  }
}
function initDatabase() {
  const conn = getConnection();
  conn.exec(`
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
  `);
  conn.exec(`
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
  `);
  conn.exec(`
    CREATE TABLE IF NOT EXISTS special_engines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      engine_code TEXT NOT NULL UNIQUE,
      gear TEXT NOT NULL,
      engine_name TEXT NOT NULL,
      operator_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  conn.exec(`
    CREATE TABLE IF NOT EXISTS planned_colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      color_code TEXT NOT NULL UNIQUE,
      color_name TEXT NOT NULL,
      top_coat_color TEXT,
      operator_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  conn.exec(`
    CREATE TRIGGER IF NOT EXISTS update_production_lines_timestamp
    AFTER UPDATE ON production_lines
    FOR EACH ROW
    BEGIN
      UPDATE production_lines SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
  conn.exec(`
    CREATE TRIGGER IF NOT EXISTS update_production_line_special_info_timestamp
    AFTER UPDATE ON production_line_special_info
    FOR EACH ROW
    BEGIN
      UPDATE production_line_special_info SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
  conn.exec(`
    CREATE TRIGGER IF NOT EXISTS update_special_engines_timestamp
    AFTER UPDATE ON special_engines
    FOR EACH ROW
    BEGIN
      UPDATE special_engines SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
  conn.exec(`
    CREATE TRIGGER IF NOT EXISTS update_planned_colors_timestamp
    AFTER UPDATE ON planned_colors
    FOR EACH ROW
    BEGIN
      UPDATE planned_colors SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);
}
function setupIpcHandlers() {
  electron.ipcMain.handle("get-current-user", async () => {
    return getCurrentUser();
  });
  electron.ipcMain.handle("get-production-lines", async () => {
    try {
      return await query("SELECT * FROM production_lines ORDER BY line_type, line_number");
    } catch (error) {
      console.error("获取生产线失败:", error);
      throw new Error("获取生产线失败");
    }
  });
  electron.ipcMain.handle("add-production-line", async (_, data) => {
    try {
      const operator = getCurrentUser();
      data.line_number = data.line_number.toUpperCase();
      data.line_name = data.line_name.toUpperCase();
      const result = await query(
        `INSERT INTO production_lines 
        (line_number, line_name, line_type, shift, speed, efficiency, \`group\`, flow_code, abbreviation, operator_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.line_number,
          data.line_name,
          data.line_type,
          data.shift,
          data.speed,
          data.efficiency,
          data.group,
          data.flow_code,
          data.abbreviation,
          operator
        ]
      );
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error("添加生产线失败:", error);
      throw new Error("添加生产线失败");
    }
  });
  electron.ipcMain.handle("update-production-line", async (_, data) => {
    try {
      const operator = getCurrentUser();
      data.line_number = data.line_number.toUpperCase();
      data.line_name = data.line_name.toUpperCase();
      await query(
        `UPDATE production_lines 
        SET line_number = ?, line_name = ?, line_type = ?, shift = ?, 
        speed = ?, efficiency = ?, \`group\` = ?, flow_code = ?, 
        abbreviation = ?, operator_id = ? 
        WHERE id = ?`,
        [
          data.line_number,
          data.line_name,
          data.line_type,
          data.shift,
          data.speed,
          data.efficiency,
          data.group,
          data.flow_code,
          data.abbreviation,
          operator,
          data.id
        ]
      );
      return { success: true };
    } catch (error) {
      console.error("更新生产线失败:", error);
      throw new Error("更新生产线失败");
    }
  });
  electron.ipcMain.handle("delete-production-line", async (_, { id }) => {
    try {
      await query("DELETE FROM production_lines WHERE id = ?", [id]);
      return { success: true };
    } catch (error) {
      console.error("删除生产线失败:", error);
      throw new Error("删除生产线失败");
    }
  });
  electron.ipcMain.handle("get-production-line-special-info", async (_, { lineId, codeType }) => {
    try {
      return await query(
        "SELECT * FROM production_line_special_info WHERE production_line_id = ? AND code_type = ?",
        [lineId, codeType]
      );
    } catch (error) {
      console.error("获取生产线特殊信息失败:", error);
      throw new Error("获取生产线特殊信息失败");
    }
  });
  electron.ipcMain.handle("add-production-line-special-info", async (_, data) => {
    try {
      const operator = getCurrentUser();
      if (data.code_type === "WhiteBodyCode") {
        data.code_value = data.code_value.toUpperCase();
      }
      const lineResult = await query("SELECT line_type FROM production_lines WHERE id = ?", [data.production_line_id]);
      const lineRows = lineResult;
      if (!lineRows || lineRows.length === 0) {
        throw new Error("找不到对应的生产线");
      }
      const line_type = lineRows[0].line_type;
      const existingResult = await query(
        "SELECT id FROM production_line_special_info WHERE production_line_id = ? AND code_type = ? AND code_value = ?",
        [data.production_line_id, data.code_type, data.code_value]
      );
      const existingRows = existingResult;
      if (existingRows && existingRows.length > 0) {
        throw new Error("该特殊信息已存在");
      }
      const result = await query(
        `INSERT INTO production_line_special_info 
        (production_line_id, code_type, code_value, line_type, operator_id) 
        VALUES (?, ?, ?, ?, ?)`,
        [data.production_line_id, data.code_type, data.code_value, line_type, operator]
      );
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error("添加生产线特殊信息失败:", error);
      throw new Error("添加生产线特殊信息失败: " + error.message);
    }
  });
  electron.ipcMain.handle("delete-production-line-special-info", async (_, { id }) => {
    try {
      await query("DELETE FROM production_line_special_info WHERE id = ?", [id]);
      return { success: true };
    } catch (error) {
      console.error("删除生产线特殊信息失败:", error);
      throw new Error("删除生产线特殊信息失败");
    }
  });
  electron.ipcMain.handle("get-special-engines", async () => {
    try {
      return await query("SELECT * FROM special_engines ORDER BY engine_code");
    } catch (error) {
      console.error("获取特殊发动机失败:", error);
      throw new Error("获取特殊发动机失败");
    }
  });
  electron.ipcMain.handle("add-special-engine", async (_, data) => {
    try {
      const operator = getCurrentUser();
      const result = await query(
        `INSERT INTO special_engines 
        (engine_code, gear, engine_name, operator_id) 
        VALUES (?, ?, ?, ?)`,
        [data.engine_code, data.gear, data.engine_name, operator]
      );
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error("添加特殊发动机失败:", error);
      throw new Error("添加特殊发动机失败");
    }
  });
  electron.ipcMain.handle("update-special-engine", async (_, data) => {
    try {
      const operator = getCurrentUser();
      await query(
        `UPDATE special_engines 
        SET engine_code = ?, gear = ?, engine_name = ?, operator_id = ? 
        WHERE id = ?`,
        [data.engine_code, data.gear, data.engine_name, operator, data.id]
      );
      return { success: true };
    } catch (error) {
      console.error("更新特殊发动机失败:", error);
      throw new Error("更新特殊发动机失败");
    }
  });
  electron.ipcMain.handle("delete-special-engine", async (_, { id }) => {
    try {
      await query("DELETE FROM special_engines WHERE id = ?", [id]);
      return { success: true };
    } catch (error) {
      console.error("删除特殊发动机失败:", error);
      throw new Error("删除特殊发动机失败");
    }
  });
  electron.ipcMain.handle("get-planned-colors", async () => {
    try {
      return await query("SELECT * FROM planned_colors ORDER BY color_code");
    } catch (error) {
      console.error("获取计划用颜色失败:", error);
      throw new Error("获取计划用颜色失败");
    }
  });
  electron.ipcMain.handle("add-planned-color", async (_, data) => {
    try {
      const operator = getCurrentUser();
      const result = await query(
        `INSERT INTO planned_colors 
        (color_code, color_name, top_coat_color, operator_id) 
        VALUES (?, ?, ?, ?)`,
        [data.color_code, data.color_name, data.top_coat_color, operator]
      );
      return { success: true, id: result.insertId };
    } catch (error) {
      console.error("添加计划用颜色失败:", error);
      throw new Error("添加计划用颜色失败");
    }
  });
  electron.ipcMain.handle("update-planned-color", async (_, data) => {
    try {
      const operator = getCurrentUser();
      await query(
        `UPDATE planned_colors 
        SET color_code = ?, color_name = ?, top_coat_color = ?, operator_id = ? 
        WHERE id = ?`,
        [data.color_code, data.color_name, data.top_coat_color, operator, data.id]
      );
      return { success: true };
    } catch (error) {
      console.error("更新计划用颜色失败:", error);
      throw new Error("更新计划用颜色失败");
    }
  });
  electron.ipcMain.handle("delete-planned-color", async (_, { id }) => {
    try {
      await query("DELETE FROM planned_colors WHERE id = ?", [id]);
      return { success: true };
    } catch (error) {
      console.error("删除计划用颜色失败:", error);
      throw new Error("删除计划用颜色失败");
    }
  });
}
if (node_os.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
const ROOT_PATH = {
  // /dist
  dist: node_path.join(__dirname, "../.."),
  // /dist or /public
  public: node_path.join(__dirname, electron.app.isPackaged ? "../.." : "../../../public")
};
let win = null;
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = node_path.join(ROOT_PATH.dist, "index.html");
async function createWindow() {
  win = new electron.BrowserWindow({
    title: "生产管理系统",
    icon: node_path.join(ROOT_PATH.public, "icon.ico"),
    width: 1200,
    height: 800,
    webPreferences: {
      preload: node_path.join(__dirname, "../preload/index.js"),
      nodeIntegration: true,
      contextIsolation: true
    }
  });
  if (!electron.app.isPackaged) {
    win.webContents.openDevTools();
  }
  if (url) {
    win.loadURL(url);
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:"))
      electron.shell.openExternal(url2);
    return { action: "deny" };
  });
  win.on("closed", () => {
    win = null;
    closeConnection();
  });
}
electron.app.whenReady().then(async () => {
  try {
    const configPath = node_path.join(electron.app.isPackaged ? process.resourcesPath : ROOT_PATH.dist, "config/database.json");
    const config = JSON.parse(fs$1.readFileSync(configPath, "utf-8"));
    const sqliteConfig = {
      database: config.database || "production_management"
    };
    const connected = await connectToDatabase(sqliteConfig);
    if (!connected) {
      electron.dialog.showErrorBox("数据库连接失败", "无法创建或连接到SQLite数据库");
    }
    setupIpcHandlers();
    createWindow();
  } catch (error) {
    console.error("初始化失败:", error);
    electron.dialog.showErrorBox("初始化失败", `无法读取数据库配置: ${error}`);
  }
});
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") {
    closeConnection();
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
function getCurrentUser() {
  try {
    return node_os.userInfo().username;
  } catch (error) {
    console.error("获取用户名失败:", error);
    return "unknown";
  }
}
exports.ROOT_PATH = ROOT_PATH;
exports.getCurrentUser = getCurrentUser;

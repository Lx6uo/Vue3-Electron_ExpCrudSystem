# 生产管理系统

基于Electron+Vue3的生产线信息管理桌面应用，用于管理生产线、特殊发动机和计划用颜色配置等基础信息。

## 技术栈

- 前端框架：Vue 3 + TypeScript + Composition API
- UI组件库：Element Plus
- 桌面应用框架：Electron
- 数据库：SQLite
- 数据库访问：better-sqlite3
- 构建工具：Vite
- 状态管理：Pinia

## 功能模块

1. 生产线信息管理
   - 生产线公共信息录入
   - 生产线特殊信息录入（白车身码/颜色码）

2. 特殊发动机管理
   - 特殊发动机信息录入

3. 计划用颜色配置
   - 颜色信息录入
   - 颜色可视化

## 数据库设置

应用会自动创建并初始化SQLite数据库，无需手动设置。数据库文件将保存在应用的`data`目录下。

数据库表结构如下：

```sql
-- 生产线信息表
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
);

-- 生产线特殊信息表
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
);

-- 特殊发动机表
CREATE TABLE IF NOT EXISTS special_engines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  engine_code TEXT NOT NULL UNIQUE,
  gear TEXT NOT NULL,
  engine_name TEXT NOT NULL,
  operator_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 计划颜色表
CREATE TABLE IF NOT EXISTS planned_colors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  color_code TEXT NOT NULL UNIQUE,
  color_name TEXT NOT NULL,
  top_coat_color TEXT,
  operator_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 安装与运行

### 环境要求

- Node.js 16+

### 安装步骤

1. 克隆项目

```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖

```bash
pnpm install --registry=https://registry.npmmirror.com/
```

3. 配置数据库

编辑 `config/database.json` 文件，填入您的数据库名称：

```json
{
  "database": "production_management"
}
```

4. 运行应用

```bash
npm run dev
```

5. 打包应用

```bash
npm run build
```

## 使用说明

### 生产线信息管理

1. 点击「生产线信息」标签页
2. 上方表格显示所有生产线信息
3. 点击表格行可选中并编辑该生产线
4. 下方表单可进行新增、编辑、删除操作
5. 切换到「生产线特殊信息录入」标签页可管理特殊信息

### 特殊发动机管理

1. 点击「特殊发动机」标签页
2. 上方表格显示所有特殊发动机信息
3. 下方表单可进行新增、编辑、删除操作

### 计划用颜色配置

1. 点击「计划用颜色配置」标签页
2. 上方表格显示所有颜色配置信息
3. 下方表单可进行新增、编辑、删除操作
4. 可使用颜色选择器选择面漆颜色
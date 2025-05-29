# 生产管理系统

基于Electron+Vue3的生产线信息管理桌面应用，用于管理生产线、特殊发动机和计划用颜色配置等基础信息。支持完整的CRUD操作，具备友好的用户界面和数据验证功能。

## 技术栈

- **前端框架**：Vue 3.3+ + TypeScript + Composition API
- **UI组件库**：Element Plus 2.4+
- **桌面应用框架**：Electron 36.0
- **数据库**：SQLite
- **数据库访问**：better-sqlite3 11.10+
- **构建工具**：Vite 4.4+
- **状态管理**：Pinia 2.1+
- **样式预处理**：Sass
- **包管理器**：pnpm（推荐）或 npm

## 功能模块

### 1. 生产线信息管理 (ProductionLine)
- **生产线基础信息管理**：线体编号、线体名称、线体类型（车身/涂装/总装）
- **生产参数配置**：班次、速度、效率等运营指标
- **特殊信息录入**：白车身码（3位字母数字）、颜色码（2位数字）
- **数据验证**：输入格式验证和重复性检查
- **批量操作**：支持批量删除和数据导入导出

### 2. 特殊发动机管理 (SpecialEngine)
- **发动机配置管理**：发动机代码、变速器类型、发动机名称
- **唯一性约束**：发动机代码唯一性验证
- **完整CRUD操作**：新增、编辑、删除、查询
- **友好确认对话框**：删除操作二次确认机制

### 3. 计划用颜色配置 (PlannedColor)
- **颜色信息管理**：颜色代码、颜色名称、面漆颜色
- **颜色可视化**：集成颜色选择器，支持可视化颜色选择
- **数据完整性**：颜色代码唯一性和格式验证
- **表单优化**：改进的表单布局和用户体验

## 数据库架构

应用使用SQLite数据库，会自动创建并初始化数据库文件 `production_management.db`，无需手动设置。数据库文件保存在应用的数据目录下。

### 数据库表结构

系统包含4个主要数据表，所有表都包含自动时间戳更新机制：

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
  line_id INTEGER NOT NULL,
  code_type TEXT NOT NULL CHECK(code_type IN ('WhiteBodyCode', 'ColorCode')),
  code_value TEXT NOT NULL,
  line_type TEXT NOT NULL CHECK(line_type IN ('车身', '涂装', '总装')),
  operator_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (line_id) REFERENCES production_lines(id) ON DELETE CASCADE,
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

### 数据库特性

- **自动时间戳**：所有表都配置了创建时间和更新时间的自动维护
- **外键约束**：生产线特殊信息表与生产线表建立外键关系，支持级联删除
- **数据完整性**：通过CHECK约束确保枚举值的有效性
- **唯一性约束**：关键字段（如线体编号、发动机代码、颜色代码）设置唯一约束
- **触发器机制**：自动更新 `updated_at` 字段时间戳

## 安装与运行

### 环境要求

- **Node.js**: 16+ (推荐 18+)
- **包管理器**: pnpm（推荐）或 npm
- **操作系统**: Windows 10/11, macOS, Linux

### 安装步骤

1. 克隆项目

```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖

使用 pnpm（推荐）：
```bash
pnpm install --registry=https://registry.npmmirror.com/
```

或使用 npm：
```bash
npm install --registry=https://registry.npmmirror.com/
```

3. 配置数据库（可选）

数据库会自动初始化，如需自定义数据库名称，可编辑 `config/database.json`：

```json
{
  "database": "production_management"
}
```

4. 开发模式运行

```bash
npm run dev
# 或
pnpm dev
```

5. 构建生产版本

```bash
npm run build
# 或
pnpm build
```

构建完成后，可执行文件将生成在 `release` 目录下。

## 使用说明

### 生产线信息管理

**基础信息管理**：
1. 点击「生产线信息」标签页
2. 上方表格显示所有生产线信息，支持排序和筛选
3. 点击表格行选中生产线，下方表单自动填充数据
4. 表单支持新增、编辑、删除操作
5. 删除操作提供友好的确认对话框

**特殊信息管理**：
1. 切换到「生产线特殊信息录入」标签页
2. 选择对应的生产线
3. 录入白车身码（3位字母数字组合）或颜色码（2位数字）
4. 系统自动验证输入格式和数据唯一性
5. 支持批量删除特殊码信息

### 特殊发动机管理

1. 点击「特殊发动机」标签页
2. 上方表格展示所有发动机配置信息
3. 下方表单进行数据维护：
   - **发动机代码**：系统自动验证唯一性
   - **变速器类型**：支持下拉选择
   - **发动机名称**：描述性信息
4. 删除操作包含详细的确认提示
5. 支持实时数据验证和错误提示

### 计划用颜色配置

1. 点击「计划用颜色配置」标签页
2. 表格显示所有颜色配置，包含颜色预览
3. 表单操作功能：
   - **颜色代码**：唯一标识符验证
   - **颜色名称**：描述性名称
   - **面漆颜色**：集成颜色选择器，支持可视化选择
4. 颜色选择器支持多种格式（HEX、RGB等）
5. 实时颜色预览和数据同步

### 通用功能特性

- **数据验证**：所有表单都包含实时输入验证
- **错误处理**：友好的错误提示和处理机制
- **确认对话框**：重要操作（如删除）提供二次确认
- **自动刷新**：数据操作后自动刷新列表
- **响应式设计**：适配不同屏幕尺寸
- **键盘快捷键**：支持常用快捷键操作

## 项目结构

```
ExpCrudSystem/
├── src/                    # 前端源码
│   ├── components/         # Vue组件
│   │   ├── ProductionLine/ # 生产线管理模块
│   │   ├── SpecialEngine/  # 特殊发动机模块
│   │   └── PlannedColor/   # 计划颜色模块
│   ├── stores/            # Pinia状态管理
│   └── main.ts            # 应用入口
├── electron/              # Electron主进程
│   ├── main/              # 主进程代码
│   └── preload/           # 预加载脚本
├── config/                # 配置文件
├── public/                # 静态资源
└── dist-electron/         # 构建输出
```

## 开发说明

- 项目采用 Vue 3 Composition API 开发模式
- 使用 TypeScript 提供类型安全
- Element Plus 提供UI组件支持
- 数据库操作通过 Electron 主进程处理
- 支持热重载开发模式
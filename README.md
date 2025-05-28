# 生产管理系统

基于Electron+Vue3的生产线信息管理桌面应用，用于管理生产线、特殊发动机和计划用颜色配置等基础信息。

## 技术栈

- 前端框架：Vue 3 + TypeScript + Composition API
- UI组件库：Element Plus
- 桌面应用框架：Electron
- 数据库：MySQL
- 数据库访问：mysql2
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

在使用本应用前，请先在MySQL中执行以下SQL脚本创建所需的数据库和表：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS production_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 使用数据库
USE production_management;
-- 创建生产线信息表
CREATE TABLE IF NOT EXISTS production_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  line_number VARCHAR(20) NOT NULL UNIQUE COMMENT '生产线编号',
  line_name VARCHAR(50) NOT NULL COMMENT '生产线名称',
  line_type ENUM('车身', '涂装', '总装') NOT NULL COMMENT '生产线类型',
  shift INT NOT NULL DEFAULT 0 COMMENT '班次',
  speed FLOAT NOT NULL DEFAULT 0 COMMENT '线速',
  efficiency FLOAT NOT NULL DEFAULT 0 COMMENT '运行效率',
  `group` INT COMMENT '组号',
  flow_code VARCHAR(20) COMMENT '流程代码',
  abbreviation VARCHAR(10) COMMENT '生产线简称',
  operator_id VARCHAR(50) COMMENT '操作人员ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- 创建生产线特殊信息表
CREATE TABLE IF NOT EXISTS production_line_special_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  production_line_id INT NOT NULL COMMENT '关联的生产线ID',
  code_type ENUM('WhiteBodyCode', 'ColorCode') NOT NULL COMMENT '编码类型：WhiteBodyCode(白车身码) 或 ColorCode(颜色码)',
  code_value VARCHAR(10) NOT NULL COMMENT '编码值',
  operator_id VARCHAR(50) COMMENT '操作人员ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (production_line_id) REFERENCES production_lines(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_line_code_type_value (production_line_id, code_type, code_value),
  UNIQUE KEY unique_code_type_value (code_type, code_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- 创建特殊发动机表
CREATE TABLE IF NOT EXISTS special_engines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  engine_code VARCHAR(10) NOT NULL UNIQUE COMMENT '发动机代码',
  gear VARCHAR(10) NOT NULL COMMENT '档位',
  engine_name VARCHAR(50) NOT NULL COMMENT '发动机名称',
  operator_id VARCHAR(50) COMMENT '操作人员ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- 创建计划颜色表
CREATE TABLE IF NOT EXISTS planned_colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  color_code VARCHAR(10) NOT NULL UNIQUE COMMENT '颜色代码',
  color_name VARCHAR(50) NOT NULL COMMENT '颜色名称',
  top_coat_color VARCHAR(50) COMMENT '面漆颜色',
  operator_id VARCHAR(50) COMMENT '操作人员ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 安装与运行

### 环境要求

- Node.js 16+
- MySQL 5.7+

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

编辑 `config/database.json` 文件，填入您的数据库连接信息：

```json
{
  "host": "localhost",
  "port": 3306,
  "user": "your_username",
  "password": "your_password",
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
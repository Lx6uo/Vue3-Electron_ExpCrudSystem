# MySQL数据库迁移

## 更改内容

### 1. 依赖包更改
- **移除**: `better-sqlite3` (已注释在 `_commented_dependencies` 中)
- **添加**: `mysql2` - MySQL数据库驱动

### 2. 配置文件更改
**文件**: `config/database.json`
```json
{
  "mysql": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "",
    "database": "production_management"
  },
  "database": "production_management"
}
```

### 3. 数据库连接代码更改
**文件**: `electron/main/database/index.ts`
- 导入 `mysql2/promise` 替代 `better-sqlite3`
- 使用MySQL连接池
- 将SQLite的SQL语法转换为MySQL语法
- 使用MySQL的 `ON UPDATE CURRENT_TIMESTAMP` 替代SQLite触发器

### 4. 表结构更改
所有表已转换为MySQL语法：
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `INT AUTO_INCREMENT PRIMARY KEY`
- `TEXT` → `VARCHAR(n)`
- `REAL` → `DECIMAL(m,n)`
- `CHECK` 约束 → `ENUM` 类型
- 添加 `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
- 使用 `ON UPDATE CURRENT_TIMESTAMP` 自动更新时间戳

## 使用前准备

### 1. 安装MySQL服务器
确保本地已安装并启动MySQL服务器。

### 2. 创建数据库
```sql
CREATE DATABASE production_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置数据库连接
根据实际情况修改 `config/database.json` 中的MySQL连接参数：
- `host`: MySQL服务器地址
- `port`: MySQL端口（默认3306）
- `user`: 数据库用户名
- `password`: 数据库密码
- `database`: 数据库名称

### 4. 启动应用
```bash
npm run dev
```

## 回滚到SQLite（如需要）

1. 在 `package.json` 中恢复 `better-sqlite3` 依赖
2. 在 `electron/main/database/index.ts` 中取消注释SQLite代码，注释MySQL代码
3. 在 `electron/main/index.ts` 中恢复SQLite配置代码
4. 运行 `pnpm install` 重新安装依赖

## 注意事项

- MySQL需要手动创建数据库，应用只会创建表结构
- 确保MySQL服务正在运行
- 检查防火墙设置，确保可以连接到MySQL端口
- 生产环境中请使用强密码并限制数据库访问权限
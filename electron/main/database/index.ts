import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

/**
 * 连接到MySQL数据库
 * @param config 数据库配置
 * @returns 是否连接成功
 */
export async function connectToDatabase(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}) {
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      // 设置连接字符集为utf8mb4
      charset: 'utf8mb4',
    });
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

/**
 * 获取数据库连接
 * @returns MySQL连接对象
 */
export function getConnection() {
  if (!connection) {
    throw new Error('数据库未连接');
  }
  return connection;
}

/**
 * 关闭数据库连接
 */
export async function closeConnection() {
  if (connection) {
    try {
      await connection.end();
      connection = null;
      console.log('数据库连接已关闭');
    } catch (error) {
      console.error('关闭数据库连接失败:', error);
    }
  }
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
    const [rows] = await conn.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL查询失败:', error);
    throw error;
  }
}
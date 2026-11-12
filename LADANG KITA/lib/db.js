import mysql from 'mysql2/promise';

/**
 * Mengambil atau menginisialisasi MySQL connection pool.
 * Dibuat secara lazy saat pertama kali dipanggil agar tidak melempar error saat build.
 */
export function getPool() {
  if (!globalThis.__lk_db_pool) {
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('DATABASE_URL belum dikonfigurasi di environment.');
    }
    const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
    globalThis.__lk_db_pool = mysql.createPool({
      uri,
      ssl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return globalThis.__lk_db_pool;
}

/**
 * Menjalankan prepared statement dengan pool.execute
 */
export async function execute(sql, params = []) {
  const pool = getPool();
  return pool.execute(sql, params);
}

/**
 * Menjalankan query standar dengan pool.query
 */
export async function query(sql, params = []) {
  const pool = getPool();
  return pool.query(sql, params);
}

export async function withTransaction(callback) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

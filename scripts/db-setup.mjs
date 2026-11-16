import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch (e) {
    // Abaikan kegagalan baca file env
  }
}

// Muat .env.local kemudian .env jika ada
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error: Variabel DATABASE_URL belum dikonfigurasi di .env.local.');
    process.exit(1);
  }

  const sslEnabled = process.env.DATABASE_SSL === 'true';
  const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: File skema tidak ditemukan di ${schemaPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Menghubungkan ke database MySQL...');
  let connection;
  try {
    connection = await mysql.createConnection({
      uri: databaseUrl,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
      multipleStatements: true,
    });
  } catch (err) {
    console.error(`Gagal menghubungkan ke database: ${err.message || 'Koneksi ditolak'}`);
    process.exit(1);
  }

  try {
    console.log('Mengeksekusi skema sql/schema.sql...');
    // Pisahkan query berdasarkan titik koma
    const statements = schemaSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('Setup database berhasil! Semua tabel dan indeks telah dibuat.');
  } catch (err) {
    console.error(`Gagal mengeksekusi skema: ${err.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main();

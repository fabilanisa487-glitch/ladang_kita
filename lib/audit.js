import { execute } from './db';
import { clean } from './security';

/**
 * Mencatat kejadian keamanan ke tabel security_events.
 * Selalu dibungkus try/catch sehingga tidak pernah melempar error ke pemanggil.
 */
export async function logEvent(type, { ip = null, userId = null, detail = null } = {}) {
  try {
    const cleanType = String(type || '').slice(0, 40);
    const cleanIp = ip ? String(ip).slice(0, 64) : null;
    const cleanUserId = userId ? String(userId).slice(0, 36) : null;
    const cleanDetail = detail ? clean(String(detail), 200) : null;

    await execute(
      'INSERT INTO security_events (type, ip, user_id, detail, created_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())',
      [cleanType, cleanIp, cleanUserId, cleanDetail]
    );
  } catch (err) {
    // Audit logging tidak boleh menggagalkan request utama
    if (process.env.NODE_ENV !== 'production') {
      console.error('Audit log warning:', err.message);
    }
  }
}

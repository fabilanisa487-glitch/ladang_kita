/**
 * Modul pengiriman email OTP (server-side only)
 */
export async function sendOtpEmail(to, code, purpose = 'password') {
  const driver = process.env.MAIL_DRIVER || 'console';

  if (driver === 'smtp') {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || '127.0.0.1',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const subject =
        purpose === 'email'
          ? 'Pemulihan Email - Ladang Kita'
          : 'Kode Verifikasi Reset Password - Ladang Kita';

      const text =
        purpose === 'email'
          ? `Halo,\n\nKode verifikasi untuk melihat alamat email akun Ladang Kita Anda adalah: ${code}\n\nKode berlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun.`
          : `Halo,\n\nKode verifikasi reset password akun Ladang Kita Anda adalah: ${code}\n\nKode berlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun.`;

      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@ladangkita.local',
        to,
        subject,
        text,
      });

      return { success: true };
    } catch (err) {
      console.error('SMTP Mailer error:', err.message);
      // Jangan bocorkan detail error SMTP ke klien
      return { success: false };
    }
  }

  // Driver console: hanya tampilkan di konsol server di non-production
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[MODE DEMO] Kode OTP ${purpose} untuk ${to}: ${code}`);
  }

  return { success: true };
}

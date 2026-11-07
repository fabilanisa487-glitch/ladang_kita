'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/data/data/context/AuthContext';
import AuthCard from '@/components/AuthCard';
import AuthOtpInput from '@/components/AuthOtpInput';
import AuthPasswordInput from '@/components/AuthPasswordInput';
import PasswordStrength from '@/components/PasswordStrength';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset, verifyOtp, resetPassword } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (step !== 4) return undefined;
    const timer = window.setTimeout(() => router.replace('/login'), 2200);
    return () => window.clearTimeout(timer);
  }, [router, step]);

  async function sendCode(event) {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Masukkan alamat email dengan format yang benar.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await requestPasswordReset(normalizedEmail);
      setNotice(result.message || 'Jika email terdaftar, kode verifikasi telah dikirim.');
      setSecondsLeft(result.resendAfter || 60);
      setStep(2);
    } catch {
      setError('Kode belum dapat dikirim. Coba lagi sebentar.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    if (secondsLeft > 0) return;
    setError('');
    try {
      const result = await requestPasswordReset(email.trim());
      setCode('');
      setNotice(result.message || 'Kode verifikasi baru telah dikirim jika email terdaftar.');
      setSecondsLeft(result.resendAfter || 60);
    } catch {
      setError('Gagal mengirim ulang kode. Coba lagi beberapa saat lagi.');
    }
  }

  async function checkCode(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await verifyOtp(email.trim(), code);
      if (!result.success) {
        setError(result.error || 'Kode verifikasi tidak sesuai.');
        return;
      }
      setResetToken(result.resetToken);
      setStep(3);
    } catch {
      setError('Gagal memverifikasi kode. Periksa koneksi dan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setError('');
    if (newPassword.length < 8 || newPassword.length > 72 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password harus memiliki panjang 8 hingga 72 karakter serta mengandung kombinasi huruf dan angka.');
      return;
    }
    if (newPassword === email.trim()) {
      setError('Password baru tidak boleh sama dengan email.');
      return;
    }
    if (newPassword !== confirmation) {
      setError('Konfirmasi password belum sama.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await resetPassword(email.trim(), resetToken, newPassword);
      if (!result.success) {
        setError(result.error || 'Password belum dapat disimpan.');
      } else {
        setStep(4);
      }
    } catch {
      setError('Password belum dapat disimpan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  const titles = {
    1: ['Pulihkan akunmu', 'Masukkan email yang kamu gunakan saat mendaftar.'],
    2: ['Periksa kode verifikasi', 'Masukkan kode 6 digit yang dikirim ke emailmu.'],
    3: ['Buat password baru', 'Gunakan password berbeda dari password sebelumnya.'],
    4: ['Password berhasil diubah', 'Kamu akan diarahkan ke halaman masuk sebentar lagi.'],
  };

  return (
    <AuthCard
      eyebrow="BANTUAN AKUN"
      title={titles[step][0]}
      description={titles[step][1]}
      footer={
        step === 4 ? null : (
          <>
            Ingat password? <Link href="/login">Kembali masuk <ArrowRight size={14} /></Link>
          </>
        )
      }
    >
      <div className="auth-stepper" aria-label={`Langkah ${Math.min(step, 3)} dari 3`}>
        {[1, 2, 3].map((number) => (
          <span className={number <= Math.min(step, 3) ? 'step-active' : ''} key={number}>
            <i>{number}</i>
            {['Email', 'Verifikasi', 'Password'][number - 1]}
          </span>
        ))}
      </div>

      {step === 1 && (
        <form className="auth-form" onSubmit={sendCode} noValidate>
          <label className="field" htmlFor="reset-email">
            Email
            <input
              id="reset-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="spinner" size={16} /> Mengirim...
              </>
            ) : (
              <>
                Kirim Kode Verifikasi <ArrowRight size={16} />
              </>
            )}
          </button>
          <Link className="auth-inline-link" href="/lupa-email">
            Lupa email yang digunakan?
          </Link>
        </form>
      )}

      {step === 2 && (
        <form className="auth-form" onSubmit={checkCode}>
          {notice && <p className="auth-message auth-success" role="status">{notice}</p>}
          <AuthOtpInput value={code} onChange={setCode} />
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={code.length !== 6 || submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="spinner" size={16} /> Memverifikasi...
              </>
            ) : (
              <>
                Verifikasi kode <ArrowRight size={16} />
              </>
            )}
          </button>
          <button
            className="resend-button"
            type="button"
            onClick={resendCode}
            disabled={secondsLeft > 0}
          >
            {secondsLeft > 0 ? `Kirim ulang kode dalam ${secondsLeft} detik` : 'Kirim ulang kode'}
          </button>
        </form>
      )}

      {step === 3 && (
        <form className="auth-form" onSubmit={savePassword} noValidate>
          <AuthPasswordInput
            id="new-password"
            label="Password baru"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />
          <PasswordStrength password={newPassword} />
          <AuthPasswordInput
            id="confirm-password"
            label="Konfirmasi password baru"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="new-password"
          />
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="spinner" size={16} /> Menyimpan...
              </>
            ) : (
              <>
                Simpan Password Baru <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="auth-complete">
          <CheckCircle2 size={34} />
          <p>Password akunmu sudah diperbarui.</p>
          <Link className="primary-button" href="/login">
            Masuk sekarang <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
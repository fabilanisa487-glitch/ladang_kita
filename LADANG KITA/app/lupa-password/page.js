'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/data/data/context/AuthContext';
import AuthCard from '@/components/AuthCard';
import AuthPasswordInput from '@/components/AuthPasswordInput';
import PasswordStrength from '@/components/PasswordStrength';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset, verifySecurityAnswer, resetPassword } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      if (!result.success) {
        setError(result.error || 'Pemulihan akun belum dapat diproses.');
        return;
      }
      setSecurityQuestion(result.question || 'Jawab pertanyaan keamanan yang kamu daftarkan.');
      setNotice(result.message || 'Jawab pertanyaan keamanan yang terdaftar pada akunmu.');
      setStep(2);
    } catch {
      setError('Pertanyaan keamanan belum dapat dimuat. Coba lagi sebentar.');
    } finally {
      setSubmitting(false);
    }
  }

  async function checkCode(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await verifySecurityAnswer(email.trim(), securityAnswer);
      if (!result.success) {
        setError(result.error || 'Jawaban keamanan tidak sesuai.');
        return;
      }
      setResetToken(result.resetToken);
      setStep(3);
    } catch {
      setError('Gagal memverifikasi jawaban. Periksa koneksi dan coba lagi.');
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
    2: ['Jawab pertanyaan keamanan', 'Gunakan jawaban yang kamu daftarkan saat membuat akun.'],
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
            {['Email', 'Pertanyaan', 'Password'][number - 1]}
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
                <LoaderCircle className="spinner" size={16} /> Memeriksa...
              </>
            ) : (
              <>
                Lanjutkan <ArrowRight size={16} />
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
          <label className="field" htmlFor="security-answer">
            {securityQuestion}
            <input
              id="security-answer"
              name="security-answer"
              type="text"
              autoComplete="off"
              maxLength={120}
              value={securityAnswer}
              onChange={(event) => setSecurityAnswer(event.target.value)}
              required
            />
          </label>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={securityAnswer.trim().length < 4 || submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="spinner" size={16} /> Memverifikasi...
              </>
            ) : (
              <>
                Verifikasi jawaban <ArrowRight size={16} />
              </>
            )}
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
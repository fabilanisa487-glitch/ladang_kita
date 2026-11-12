'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/data/data/context/AuthContext';
import { apiCaptcha, apiLoginCsrf, safeNextPath } from '@/lib/authClient';
import AuthCard from './AuthCard';
import AuthPasswordInput from './AuthPasswordInput';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthForm({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = safeNextPath(searchParams ? searchParams.get('next') : '/');

  const {
    user,
    loading: authLoading,
    login,
    register,
    completeSecuritySetup,
  } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securitySetupRequired, setSecuritySetupRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [securitySetupSubmitting, setSecuritySetupSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(destination);
    }
  }, [authLoading, router, user, destination]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Masukkan alamat email dengan format yang benar.');
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError('Password harus memiliki panjang 8 hingga 72 karakter.');
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password harus mengandung kombinasi huruf dan angka.');
      return;
    }

    if (password.toLowerCase() === normalizedEmail.toLowerCase()) {
      setError('Password tidak boleh sama dengan email.');
      return;
    }

    if (isRegister && password !== confirmation) {
      setError('Konfirmasi password belum sama.');
      return;
    }

    if (isRegister && (securityQuestion.trim().length < 8 ||
      securityAnswer.trim().length < 4 ||
      securityAnswer.trim().length > 120 ||
      new TextEncoder().encode(securityAnswer.normalize('NFKC').trim().replace(/\s+/gu, ' ')).length > 72)) {
      setError('Pertanyaan keamanan minimal 8 karakter. Jawaban harus 4 hingga 120 karakter dan maksimal 72 byte.');
      return;
    }

    if (isRegister && phone && !/^(?:08\d{8,11}|\+628\d{8,11})$/.test(phone.replace(/[\s()-]/g, ''))) {
      setError('Masukkan nomor HP dengan format 08xx atau +62xx.');
      return;
    }

    setSubmitting(true);
    try {
      const result = isRegister
        ? await register(name, normalizedEmail, password, phone, securityQuestion, securityAnswer)
        : await (async () => {
          let tokenResult = await apiLoginCsrf();
          if (!tokenResult.success) {
            return tokenResult;
          }

          let result = await login(
            normalizedEmail,
            password,
            remember,
            captcha ? { id: captcha.id, answer: captchaAnswer } : undefined,
            tokenResult.token
          );
          if (!result.success && result.csrfRequired) {
            tokenResult = await apiLoginCsrf();
            if (!tokenResult.success) return tokenResult;
            result = await login(
              normalizedEmail,
              password,
              remember,
              captcha ? { id: captcha.id, answer: captchaAnswer } : undefined,
              tokenResult.token
            );
          }
          return result;
        })();

      if (!result.success) {
        setError(result.error || 'Tidak dapat memproses permintaan. Coba lagi.');
        if (!isRegister && result.captchaRequired) {
          setCaptchaAnswer('');
          const challenge = await apiCaptcha();
          if (challenge.success) {
            setCaptcha({ id: challenge.id, question: challenge.question });
          } else {
            setCaptcha(null);
            setError(`${result.error || 'Tidak dapat memproses permintaan. Coba lagi.'} ${challenge.error}`);
          }
        }
      } else if (result.requiresSecuritySetup) {
        setSecuritySetupRequired(true);
        setError('');
      } else {
        setCaptcha(null);
        setCaptchaAnswer('');
        router.replace(destination);
      }
    } catch {
      setError('Terjadi kendala. Periksa koneksi dan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSecuritySetup(event) {
    event.preventDefault();
    setError('');
    setSecuritySetupSubmitting(true);
    try {
      const result = await completeSecuritySetup(securityQuestion, securityAnswer);
      if (!result.success) {
        setError(result.error || 'Pertanyaan keamanan belum dapat disimpan.');
        return;
      }
      router.replace(destination);
    } catch {
      setError('Pertanyaan keamanan belum dapat disimpan. Coba lagi.');
    } finally {
      setSecuritySetupSubmitting(false);
    }
  }

  if (authLoading || user) {
    return <main className="auth-loading" aria-live="polite">Mengarahkan...</main>;
  }

  return (
    <AuthCard
      eyebrow={isRegister ? 'GABUNG DENGAN KAMI' : 'SELAMAT DATANG KEMBALI'}
      title={isRegister ? 'Buat akun baru' : 'Masuk ke akunmu'}
      description={
        securitySetupRequired
          ? 'Tambahkan pertanyaan dan jawaban untuk memulihkan akun tanpa email.'
          : isRegister
          ? 'Simpan pilihan hasil panen dan nikmati belanja yang lebih mudah.'
          : 'Masuk untuk melanjutkan belanja hasil panen segar.'
      }
      footer={
        isRegister ? (
          <>
            Sudah punya akun? <Link href="/login">Masuk</Link>
          </>
        ) : (
          <>
            Belum punya akun?{' '}
            <Link href="/daftar">
              Daftar <ArrowRight size={14} />
            </Link>
          </>
        )
      }
    >
      {securitySetupRequired ? (
        <form className="auth-form" onSubmit={handleSecuritySetup} noValidate aria-busy={securitySetupSubmitting}>
          <label className="field" htmlFor="security-question">
            Pertanyaan keamanan
            <input
              id="security-question"
              name="security-question"
              maxLength={160}
              value={securityQuestion}
              onChange={(event) => setSecurityQuestion(event.target.value)}
              required
            />
          </label>
          <label className="field" htmlFor="security-answer">
            Jawaban keamanan
            <input
              id="security-answer"
              name="security-answer"
              type="password"
              autoComplete="off"
              maxLength={120}
              value={securityAnswer}
              onChange={(event) => setSecurityAnswer(event.target.value)}
              required
            />
          </label>
          <p className="text-xs text-muted">
            Gunakan pertanyaan yang hanya bisa dijawab olehmu. Jawaban disimpan dalam bentuk hash.
          </p>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit" disabled={securitySetupSubmitting}>
            {securitySetupSubmitting ? 'Menyimpan...' : 'Simpan pertanyaan keamanan'}
          </button>
        </form>
      ) : (
      <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
        {isRegister && (
          <label className="field" htmlFor="name">
            Nama lengkap
            <input
              id="name"
              name="name"
              autoComplete="name"
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
        )}
        <label className="field" htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={191}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={error ? 'auth-error' : undefined}
            required
          />
        </label>
        {isRegister && (
          <label className="field" htmlFor="phone">
            Nomor HP <span className="optional-label">Opsional</span>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={20}
              placeholder="08xx atau +62xx"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
        )}
        <AuthPasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          describedBy={error ? 'auth-error' : undefined}
        />
        {!isRegister && captcha && (
          <label className="field" htmlFor="captcha-answer">
            {captcha.question}
            <input
              id="captcha-answer"
              name="captcha-answer"
              inputMode="numeric"
              autoComplete="off"
              maxLength={3}
              value={captchaAnswer}
              onChange={(event) => setCaptchaAnswer(event.target.value.replace(/[^0-9]/g, ''))}
              aria-describedby={error ? 'auth-error' : undefined}
              required
            />
          </label>
        )}
        {isRegister && (
          <AuthPasswordInput
            id="confirmation"
            label="Ulangi password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="new-password"
            describedBy={error ? 'auth-error' : undefined}
          />
        )}
        {isRegister && (
          <>
            <label className="field" htmlFor="security-question">
              Pertanyaan keamanan untuk pemulihan akun
              <input
                id="security-question"
                name="security-question"
                maxLength={160}
                value={securityQuestion}
                onChange={(event) => setSecurityQuestion(event.target.value)}
                placeholder="Contoh: Apa nama hewan peliharaan pertamamu?"
                required
              />
            </label>
            <label className="field" htmlFor="security-answer">
              Jawaban keamanan
              <input
                id="security-answer"
                name="security-answer"
                type="password"
                autoComplete="off"
                maxLength={120}
                value={securityAnswer}
                onChange={(event) => setSecurityAnswer(event.target.value)}
                required
              />
            </label>
          </>
        )}
        {!isRegister && (
          <label className="remember-option">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Ingat saya</span>
          </label>
        )}
        {isRegister && (
          <p className="privacy-note text-xs text-muted" style={{ fontSize: '0.8rem', color: '#666' }}>
            Data kamu hanya dipakai untuk pesanan.
          </p>
        )}
        {error && (
          <p className="auth-message auth-error" id="auth-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary-button auth-submit" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <LoaderCircle className="spinner" size={16} /> Memproses...
            </>
          ) : (
            <>
              {isRegister ? 'Buat akun' : 'Masuk'} <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
      )}
      {!isRegister && (
        <div className="auth-recovery-links">
          <Link href="/lupa-password">Lupa password?</Link>
        </div>
      )}
    </AuthCard>
  );
}
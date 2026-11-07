'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LoaderCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '@/data/data/context/AuthContext';
import AuthCard from '@/components/AuthCard';
import AuthOtpInput from '@/components/AuthOtpInput';

const PHONE_PATTERN = /^(?:08\d{8,11}|\+628\d{8,11})$/;
const WHATSAPP_URL = 'https://wa.me/6281234567890?text=Halo%20Ladang%20Kita%2C%20saya%20butuh%20bantuan%20memulihkan%20akun.';

export default function ForgotEmailPage() {
  const { requestEmailRecovery, verifyEmailRecovery } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  async function sendCode(event) {
    event.preventDefault();
    setError('');
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    if (!PHONE_PATTERN.test(normalizedPhone)) {
      setError('Gunakan format nomor 08xx atau +62xx.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Masukkan nama lengkap sesuai data akun.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestEmailRecovery(normalizedPhone, name);
      setNotice(result.message || 'Jika data cocok dengan akun terdaftar, kode verifikasi telah dikirim ke email terdaftar.');
      setSecondsLeft(result.resendAfter || 60);
      setCode('');
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
      const result = await requestEmailRecovery(phone.replace(/[\s()-]/g, ''), name);
      setCode('');
      setNotice(result.message || 'Kode verifikasi baru telah dikirim.');
      setSecondsLeft(result.resendAfter || 60);
    } catch {
      setError('Gagal mengirim ulang kode. Coba lagi beberapa saat lagi.');
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await verifyEmailRecovery(phone.replace(/[\s()-]/g, ''), code);
      if (!result.success) {
        setError(result.error || 'Kode verifikasi tidak sesuai.');
        return;
      }
      setMaskedEmail(result.email);
      setStep(3);
    } catch {
      setError('Terjadi kendala saat memverifikasi kode.');
    } finally {
      setSubmitting(false);
    }
  }

  const titles = {
    1: ['Cari email akunmu', 'Masukkan nomor HP dan nama lengkap yang terdaftar.'],
    2: ['Verifikasi nomor HP', 'Masukkan kode 6 digit yang dikirim ke email akun.'],
    3: ['Email akun ditemukan', 'Email ditampilkan sebagian untuk menjaga privasi akunmu.'],
  };

  return (
    <AuthCard
      eyebrow="BANTUAN AKUN"
      title={titles[step][0]}
      description={titles[step][1]}
      footer={
        <>
          Sudah ingat email? <Link href="/login">Kembali masuk <ArrowRight size={14} /></Link>
        </>
      }
    >
      <div className="auth-stepper" aria-label={`Langkah ${step} dari 3`}>
        {[1, 2, 3].map((number) => (
          <span className={number <= step ? 'step-active' : ''} key={number}>
            <i>{number}</i>
            {['Data akun', 'Verifikasi', 'Selesai'][number - 1]}
          </span>
        ))}
      </div>

      {step === 1 && (
        <form className="auth-form" onSubmit={sendCode} noValidate>
          <label className="field" htmlFor="recovery-phone">
            Nomor HP
            <input
              id="recovery-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="08xx atau +62xx"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          <label className="field" htmlFor="recovery-name">
            Nama lengkap
            <input
              id="recovery-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
          {error && (
            <div className="auth-message auth-error" role="alert">
              <span>{error}</span>
              {error.startsWith('Data tidak ditemukan') && (
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Buka WhatsApp
                </a>
              )}
            </div>
          )}
          <button className="primary-button auth-submit" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="spinner" size={16} /> Memeriksa...
              </>
            ) : (
              <>
                Kirim Kode Verifikasi <ArrowRight size={16} />
              </>
            )}
          </button>
          <p className="recovery-contact">
            <MessageCircle size={14} /> Bantuan lain?{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              WhatsApp Ladang Kita
            </a>
          </p>
        </form>
      )}

      {step === 2 && (
        <form className="auth-form" onSubmit={verifyCode}>
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
        <div className="auth-complete">
          <CheckCircle2 size={34} />
          <p>Email akunmu:</p>
          <strong className="masked-email">{maskedEmail}</strong>
          <Link className="primary-button" href="/login">
            Masuk Sekarang <ArrowRight size={15} />
          </Link>
          <Link className="auth-inline-link" href="/lupa-password">
            Lupa password?
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
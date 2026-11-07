'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const form = new FormData(event.currentTarget);
    const rawName = String(form.get('name') || '').replace(/[\x00-\x1F\x7F]/g, '').trim();
    const rawEmail = String(form.get('email') || '').replace(/[\x00-\x1F\x7F]/g, '').trim().toLowerCase();
    const rawMessage = String(form.get('message') || '').replace(/[\x00-\x1F\x7F]/g, '').trim();

    if (rawName.length < 2 || rawName.length > 80) {
      setError('Nama harus memiliki panjang 2 sampai 80 karakter.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) || rawEmail.length > 191) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    if (rawMessage.length < 10 || rawMessage.length > 1000) {
      setError('Pesan harus memiliki panjang 10 sampai 1000 karakter.');
      return;
    }

    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <form className="form-panel" onSubmit={handleSubmit} noValidate>
      <h2>Kirim pesan</h2>
      {sent && (
        <p className="form-message" role="status">
          Terima kasih, pesanmu sudah dicatat. Tim kami akan segera menghubungi kamu.
        </p>
      )}
      {error && (
        <p className="auth-message auth-error" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </p>
      )}
      <div className="form-grid">
        <label className="field field-full">
          Nama
          <input name="name" autoComplete="name" maxLength={80} required placeholder="Nama kamu" />
        </label>
        <label className="field field-full">
          Email
          <input name="email" type="email" autoComplete="email" maxLength={191} required placeholder="nama@email.com" />
        </label>
        <label className="field field-full">
          Pesan
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={1000}
            placeholder="Ceritakan apa yang ingin kamu tanyakan"
          />
        </label>
      </div>
      <button className="primary-button contact-submit" type="submit">
        Kirim pesan <Send size={15} />
      </button>
      <p className="summary-note">Form ini adalah demo dan belum mengirim data ke server.</p>
    </form>
  );
}
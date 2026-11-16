'use client';

import { useRef } from 'react';

export default function AuthOtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  function updateDigit(index, rawValue) {
    const incoming = rawValue.replace(/\D/g, '');
    const next = digits.map((digit) => digit.trim());
    if (incoming.length > 1) {
      incoming.slice(0, 6 - index).split('').forEach((digit, offset) => { next[index + offset] = digit; });
      onChange(next.join(''));
      inputs.current[Math.min(index + incoming.length, 5)]?.focus();
      return;
    }
    next[index] = incoming.slice(-1);
    onChange(next.join(''));
    if (incoming && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !digits[index].trim() && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < 5) inputs.current[index + 1]?.focus();
  }

  function handlePaste(event) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <fieldset className="otp-fieldset">
      <legend>Kode verifikasi</legend>
      <div className="otp-inputs" onPaste={handlePaste}>
        {digits.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element; }} type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} pattern="[0-9]" maxLength={1} value={digit.trim()} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} aria-label={`Digit ${index + 1} dari 6 kode verifikasi`} aria-required="true" />)}
      </div>
      <span className="otp-help">Masukkan 6 digit kode. Kamu juga bisa menempelkan kode sekaligus.</span>
    </fieldset>
  );
}
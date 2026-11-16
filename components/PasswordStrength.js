export default function PasswordStrength({ password }) {
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasVariety = /[A-Z]/.test(password) && /[^a-zA-Z0-9]/.test(password);
  const score = password ? (hasLength && hasLetter && hasNumber ? (password.length >= 12 && hasVariety ? 3 : 2) : 1) : 0;
  const label = ['Belum diisi', 'Lemah', 'Sedang', 'Kuat'][score];

  return <div className={`password-strength strength-${score}`} aria-live="polite"><div className="strength-meter" aria-hidden="true">{[1, 2, 3].map((part) => <span className={part <= score ? 'strength-filled' : ''} key={part} />)}</div><span>Kekuatan password: <strong>{label}</strong></span></div>;
}
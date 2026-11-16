'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function AuthPasswordInput({ id, label = 'Password', value, onChange, autoComplete, describedBy, required = true }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <span className="password-control">
        <input id={id} name={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} minLength={10} maxLength={128} required={required} aria-describedby={describedBy} />
        <button className="password-toggle" type="button" onClick={() => setVisible((show) => !show)} aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'} aria-pressed={visible}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </div>
  );
}
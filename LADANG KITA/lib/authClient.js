/**
 * Modul client-side authClient untuk berinteraksi dengan API autentikasi server.
 * Menggunakan fetch dengan credentials: 'same-origin'.
 * TIDAK menyimpan rahasia/token/user di localStorage.
 */

async function postJson(url, data, headers = {}) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || 'Terjadi kesalahan saat memproses permintaan.',
        ...json,
      };
    }
    return { success: true, ...json };
  } catch {
    return { success: false, error: 'Tidak dapat terhubung ke server. Periksa koneksi internet.' };
  }
}

export async function apiRegister({
  name,
  email,
  password,
  phone = '',
  securityQuestion,
  securityAnswer,
}) {
  return postJson('/api/auth/register', {
    name,
    email,
    password,
    phone,
    securityQuestion,
    securityAnswer,
  });
}

export async function apiLogin({ email, password, remember = true, captcha, csrfToken }) {
  return postJson('/api/auth/login', {
    email,
    password,
    remember,
    ...(captcha ? { captchaId: captcha.id, captchaAnswer: captcha.answer } : {}),
  }, csrfToken ? { 'x-csrf-token': csrfToken } : {});
}

export async function apiLoginCsrf() {
  try {
    const res = await fetch('/api/auth/csrf', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || typeof json.token !== 'string') {
      return { success: false, error: json.error || 'Tidak dapat memuat token keamanan.' };
    }
    return { success: true, token: json.token };
  } catch {
    return { success: false, error: 'Tidak dapat terhubung ke server. Periksa koneksi internet.' };
  }
}

export async function apiCaptcha() {
  try {
    const res = await fetch('/api/auth/captcha', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error || 'Tidak dapat memuat pertanyaan keamanan.' };
    }
    return { success: true, ...json };
  } catch {
    return { success: false, error: 'Tidak dapat terhubung ke server. Periksa koneksi internet.' };
  }
}

export async function apiLogout() {
  return postJson('/api/auth/logout', {});
}

export async function apiMe() {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
    });
    const json = await res.json().catch(() => ({}));
    return { success: res.ok, user: json.user || null };
  } catch {
    return { success: false, user: null };
  }
}

export async function apiForgot({ email }) {
  return postJson('/api/auth/forgot', { email });
}

export async function apiVerifySecurityAnswer({ email, answer }) {
  return postJson('/api/auth/verify-otp', { email, answer });
}

export async function apiEnrollSecurityQuestion({ question, answer }) {
  return postJson('/api/auth/security-question', { question, answer });
}

export async function apiResetPassword({ email, resetToken, newPassword }) {
  return postJson('/api/auth/reset-password', { email, resetToken, newPassword });
}

export async function apiRecoverEmailRequest({ phone, name }) {
  return postJson('/api/auth/recover-email/request', { phone, name });
}

export async function apiRecoverEmailVerify({ phone, code }) {
  return postJson('/api/auth/recover-email/verify', { phone, code });
}

export function safeNextPath(next) {
  if (typeof next !== 'string') return '/';
  const trimmed = next.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes('\\') &&
    !trimmed.includes(':')
  ) {
    return trimmed;
  }
  return '/';
}

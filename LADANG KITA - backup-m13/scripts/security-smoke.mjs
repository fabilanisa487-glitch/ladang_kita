/**
 * Smoke test suite keamanan untuk Ladang Kita
 * Menguji 10 kriteria keamanan penting via HTTP fetch ke http://localhost:3000
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const results = [];

function recordResult(testNumber, description, passed, detail = '') {
  results.push({ testNumber, description, passed, detail });
  const statusStr = passed ? 'LULUS' : 'GAGAL';
  console.log(`[${statusStr}] Kasus ${testNumber}: ${description}${detail ? ` (${detail})` : ''}`);
}

async function runTests() {
  console.log(`\n=== MEMULAI SMOKE TEST KEAMANAN LADANG KITA (${BASE_URL}) ===\n`);

  let sessionCookie = null;
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'User Test Smoke';

  // 10. Halaman / memuat header X-Content-Type-Options dan tidak memuat X-Powered-By
  try {
    const resHome = await fetch(`${BASE_URL}/`);
    const nosniff = resHome.headers.get('x-content-type-options') === 'nosniff';
    const noPoweredBy = !resHome.headers.get('x-powered-by');
    recordResult(
      10,
      'Halaman / memuat header X-Content-Type-Options dan tidak memuat X-Powered-By',
      nosniff && noPoweredBy,
      `nosniff=${nosniff}, noPoweredBy=${noPoweredBy}`
    );
  } catch (e) {
    recordResult(10, 'Halaman / header check', false, e.message);
  }

  // 4. Permintaan POST dengan header Origin situs lain ditolak 403
  try {
    const resCsrf = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil-attacker-site.com',
      },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    recordResult(
      4,
      'Permintaan POST dengan header Origin situs lain ditolak 403',
      resCsrf.status === 403,
      `status=${resCsrf.status}`
    );
  } catch (e) {
    recordResult(4, 'CSRF Origin check', false, e.message);
  }

  // 1. Daftar akun acak berhasil; header Set-Cookie memuat HttpOnly dan SameSite=Lax
  try {
    const resRegister = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
      },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        phone: '081234567890',
      }),
    });

    const regJson = await resRegister.json().catch(() => ({}));
    const setCookie = resRegister.headers.get('set-cookie') || '';
    const hasHttpOnly = /httponly/i.test(setCookie);
    const hasSameSiteLax = /samesite=lax/i.test(setCookie);

    if (resRegister.ok && regJson.success && hasHttpOnly && hasSameSiteLax) {
      sessionCookie = setCookie.split(';')[0];
      recordResult(
        1,
        'Daftar akun acak berhasil; header Set-Cookie memuat HttpOnly dan SameSite=Lax',
        true
      );
    } else {
      recordResult(
        1,
        'Daftar akun acak berhasil; header Set-Cookie memuat HttpOnly dan SameSite=Lax',
        false,
        `status=${resRegister.status}, body=${JSON.stringify(regJson)}, cookie=${setCookie}`
      );
    }
  } catch (e) {
    recordResult(1, 'Daftar akun acak', false, e.message);
  }

  // 2. /api/auth/me dengan cookie mengembalikan user; dengan cookie palsu mengembalikan user: null
  try {
    const resMeValid = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: sessionCookie ? { Cookie: sessionCookie } : {},
    });
    const jsonMeValid = await resMeValid.json().catch(() => ({}));
    const hasUser = jsonMeValid.user && jsonMeValid.user.email === testEmail;

    const resMeFake = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: 'lk_session=fake_invalid_session_token_12345' },
    });
    const jsonMeFake = await resMeFake.json().catch(() => ({}));
    const fakeNull = jsonMeFake.user === null;

    recordResult(
      2,
      '/api/auth/me dengan cookie mengembalikan user; cookie palsu mengembalikan user: null',
      hasUser && fakeNull,
      `validUser=${!!hasUser}, fakeNull=${fakeNull}`
    );
  } catch (e) {
    recordResult(2, 'Endpoint /api/auth/me check', false, e.message);
  }

  // 3. Login salah 6 kali pada email yang sama menghasilkan 429 pada percobaan ke-6
  try {
    const wrongEmail = `wrong_${Date.now()}@example.com`;
    let got429 = false;
    for (let i = 1; i <= 6; i++) {
      const resWrong = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
        body: JSON.stringify({ email: wrongEmail, password: 'WrongPassword123' }),
      });
      if (i === 6 && resWrong.status === 429) {
        got429 = true;
      }
    }
    recordResult(
      3,
      'Login salah 6 kali pada email yang sama menghasilkan 429 pada percobaan ke-6',
      got429,
      got429 ? 'Percobaan ke-6 ditolak dengan 429' : 'Belum menerima 429 pada percobaan ke-6'
    );
  } catch (e) {
    recordResult(3, 'Login throttle check', false, e.message);
  }

  // 5. /api/auth/forgot untuk email terdaftar dan tidak terdaftar menghasilkan body JSON identik
  try {
    const resForgot1 = await fetch(`${BASE_URL}/api/auth/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
      body: JSON.stringify({ email: testEmail }),
    });
    const body1 = await resForgot1.text();

    const resForgot2 = await fetch(`${BASE_URL}/api/auth/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
      body: JSON.stringify({ email: 'unregistered_random_user_99@example.com' }),
    });
    const body2 = await resForgot2.text();

    const identical = body1 === body2;
    recordResult(
      5,
      '/api/auth/forgot untuk email terdaftar dan tidak terdaftar menghasilkan body JSON identik',
      identical,
      identical ? 'Respons identik' : `body1: ${body1} != body2: ${body2}`
    );
  } catch (e) {
    recordResult(5, 'Forgot password response timing neutrality', false, e.message);
  }

  // 6. Tidak ada respons API yang memuat kunci demoCode, code, atau password_hash
  try {
    const testEndpoints = [
      fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
        body: JSON.stringify({
          name: 'Another User',
          email: `check_keys_${Date.now()}@example.com`,
          password: 'AnotherPassword123',
        }),
      }),
      fetch(`${BASE_URL}/api/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
        body: JSON.stringify({ email: testEmail }),
      }),
      fetch(`${BASE_URL}/api/auth/me`, {
        headers: sessionCookie ? { Cookie: sessionCookie } : {},
      }),
    ];

    const responses = await Promise.all(testEndpoints);
    let leaks = false;
    for (const res of responses) {
      const text = await res.text();
      if (text.includes('demoCode') || text.includes('password_hash') || /"code"\s*:\s*"\d{6}"/.test(text)) {
        leaks = true;
      }
    }
    recordResult(
      6,
      'Tidak ada respons API yang memuat kunci demoCode, code, atau password_hash',
      !leaks,
      leaks ? 'Terdeteksi kunci bocor' : 'Semua respons bersih'
    );
  } catch (e) {
    recordResult(6, 'Sensitive key leakage check', false, e.message);
  }

  // 7. /api/checkout tanpa sesi menghasilkan 401; dengan sesi dan kuantitas invalid ditolak 400
  try {
    const resNoAuth = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
      body: JSON.stringify({ items: [{ id: '1', quantity: 1 }] }),
    });
    const status401 = resNoAuth.status === 401;

    let allInvalidRejected = true;
    const invalidQuantities = [-1, 1.5, 'abc', 999];
    if (sessionCookie) {
      for (const q of invalidQuantities) {
        const resBadQty = await fetch(`${BASE_URL}/api/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: BASE_URL, Cookie: sessionCookie },
          body: JSON.stringify({
            name: 'Penerima Test',
            phone: '081234567890',
            address: 'Jalan Raya Sawah Indah No 123',
            city: 'Bandung',
            postalCode: '40123',
            items: [{ id: '1', quantity: q }],
          }),
        });
        if (resBadQty.status !== 400) {
          allInvalidRejected = false;
        }
      }
    } else {
      allInvalidRejected = false;
    }

    recordResult(
      7,
      '/api/checkout tanpa sesi = 401; kuantitas -1, 1.5, "abc", 999 ditolak 400',
      status401 && allInvalidRejected,
      `noAuth401=${status401}, allBadQty400=${allInvalidRejected}`
    );
  } catch (e) {
    recordResult(7, 'Checkout validation check', false, e.message);
  }

  // 8. Ulasan berisi <img src=x onerror=alert(1)> tersimpan & dibersihkan dari < >; rating 0, 6, "x" ditolak
  try {
    let xssCleaned = false;
    let badRatingsRejected = true;

    if (sessionCookie) {
      // Test bad ratings
      for (const badR of [0, 6, 'x']) {
        const resBadR = await fetch(`${BASE_URL}/api/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: BASE_URL, Cookie: sessionCookie },
          body: JSON.stringify({ productId: '1', rating: badR, comment: 'Ulasan pengujian bagus' }),
        });
        if (resBadR.status !== 400) badRatingsRejected = false;
      }

      // Test XSS payload comment
      const xssComment = 'Beras mantap <img src=x onerror=alert(1)> sangat segar';
      const resXss = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: BASE_URL, Cookie: sessionCookie },
        body: JSON.stringify({ productId: '1', rating: 5, comment: xssComment }),
      });

      if (resXss.ok) {
        const resGet = await fetch(`${BASE_URL}/api/reviews?productId=1`);
        const jsonGet = await resGet.json();
        const saved = (jsonGet.reviews || []).find((r) => r.comment.includes('Beras mantap'));
        if (saved && !saved.comment.includes('<') && !saved.comment.includes('>')) {
          xssCleaned = true;
        }
      }
    }

    recordResult(
      8,
      'Ulasan XSS dibersihkan (< dan > dihilangkan); rating 0, 6, "x" ditolak 400',
      xssCleaned && badRatingsRejected,
      `xssCleaned=${xssCleaned}, badRatingsRejected=${badRatingsRejected}`
    );
  } catch (e) {
    recordResult(8, 'Review XSS & rating validation', false, e.message);
  }

  // 9. Pengguna B tidak bisa menghapus ulasan pengguna A (403/404)
  try {
    // Buat Pengguna B
    const resUserB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
      body: JSON.stringify({
        name: 'User B Smoke',
        email: `user_b_${Date.now()}@example.com`,
        password: 'UserBPassword123!',
      }),
    });

    const cookieB = (resUserB.headers.get('set-cookie') || '').split(';')[0];

    // User B mencoba menghapus review produk 1 (yang dibuat User A)
    // Karena User B belum punya ulasan di produk 1, server harus mengembalikan 404
    const resDelOther = await fetch(`${BASE_URL}/api/reviews?productId=1`, {
      method: 'DELETE',
      headers: { Origin: BASE_URL, Cookie: cookieB },
    });

    const notAllowed = resDelOther.status === 404 || resDelOther.status === 403;
    recordResult(
      9,
      'Pengguna B tidak bisa menghapus ulasan pengguna A (403/404)',
      notAllowed,
      `status=${resDelOther.status}`
    );
  } catch (e) {
    recordResult(9, 'Review IDOR / unauthorized deletion', false, e.message);
  }

  console.log('\n=== RINGKASAN HASIL SMOKE TEST ===');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Total: ${results.length} | Lulus: ${passedCount} | Gagal: ${results.length - passedCount}\n`);
}

runTests();

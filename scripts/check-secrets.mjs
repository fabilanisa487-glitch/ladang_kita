import fs from 'node:fs';
import path from 'node:path';

const SECRET_PATTERNS = [
  { name: 'Midtrans Sandbox Server Key', regex: /SB-Mid-server-[A-Za-z0-9_-]+/ },
  { name: 'Midtrans Production Server Key', regex: /Mid-server-[A-Za-z0-9_-]+/ },
  { name: 'GitHub Personal Access Token', regex: /ghp_[A-Za-z0-9_]{30,}/ },
  { name: 'GitHub Fine-grained PAT', regex: /github_pat_[A-Za-z0-9_]{30,}/ },
  { name: 'Client Secret Hardcoded', regex: /client_secret\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Private Key Header', regex: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/ },
  { name: 'MySQL URI with Password', regex: /mysql:\/\/[^:]+:[^@\s/]+@/ },
];

const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', '.vscode', 'public']);
const IGNORE_FILES = new Set(['package-lock.json', 'check-secrets.mjs']);

const findings = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      // Abaikan file dokumentasi dan template contoh
      if (filePath.endsWith('.env.example') || filePath.endsWith('.md')) return;

      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          findings.push({
            patternName: pattern.name,
            file: path.relative(process.cwd(), filePath),
            line: index + 1,
          });
        }
      }
    });
  } catch {
    // Abaikan error pembacaan file biner atau tidak dapat diakses
  }
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        walkDir(path.join(dir, entry.name));
      }
    } else if (entry.isFile()) {
      if (!IGNORE_FILES.has(entry.name) && !entry.name.endsWith('.jpg') && !entry.name.endsWith('.png') && !entry.name.endsWith('.sqlite')) {
        scanFile(path.join(dir, entry.name));
      }
    }
  }
}

console.log('Memulai pemindaian kebocoran rahasia...');
walkDir(process.cwd());

if (findings.length === 0) {
  console.log('✓ Tidak ditemukan rahasia yang ter-hardcode di kode proyek.');
  process.exit(0);
} else {
  console.error(`PERINGATAN: Ditemukan ${findings.length} potensi kebocoran rahasia:`);
  findings.forEach((f) => {
    console.error(`- [${f.patternName}] di file ${f.file}:${f.line} (WAJIB di-rotate jika pernah di-commit)`);
  });
  process.exit(1);
}

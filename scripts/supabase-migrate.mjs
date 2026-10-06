// تنفيذ ملفات SQL على Supabase عبر Management API (يحتاج Personal Access Token)
// الاستخدام:
//   $env:SUPABASE_MGMT_TOKEN='sbp_...'; $env:SUPABASE_PROJECT_REF='xxxx'
//   node scripts/supabase-migrate.mjs [supabase/migrations/001_leads.sql]
// ملحوظة: التوكن لا يُحفظ أبداً داخل المشروع.
import { readFileSync } from 'node:fs'

const token = process.env.SUPABASE_MGMT_TOKEN
const ref = process.env.SUPABASE_PROJECT_REF
const file = process.argv[2] ?? 'supabase/migrations/001_leads.sql'
if (!token || !ref) {
  console.error('Missing SUPABASE_MGMT_TOKEN or SUPABASE_PROJECT_REF')
  process.exit(1)
}
const sql = readFileSync(file, 'utf8')
// الـ endpoint بينفذ statement واحد في المرة - نقسم الملف لعبارات
const statements = sql
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith('--'))
for (const [i, stmt] of statements.entries()) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: stmt }),
  })
  const text = await res.text()
  console.log(`[${i + 1}/${statements.length}] HTTP`, res.status, text.slice(0, 300))
  if (!res.ok) process.exit(1)
}

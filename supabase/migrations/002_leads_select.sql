-- السماح بقراءة الليدز لصفحة /labs/users/leads (بدون تسجيل دخول)
-- نفّذ الملف ده مرة واحدة في Supabase: SQL Editor ثم Run
-- تحذير: ده بيخلي الأسماء والأرقام قابلة للقراءة بأي مفتاح نشر (anon).
-- لو حابب تقفلها لاحقاً احذف الـ policy دي:
--   drop policy "anon select leads" on public.leads;
-- supabase/migrations/002_leads_select.sql

drop policy if exists "anon select leads" on public.leads;
create policy "anon select leads"
  on public.leads for select
  to anon
  using (true);

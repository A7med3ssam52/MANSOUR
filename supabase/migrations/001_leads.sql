-- جدول الليدز + نتائج الحاسبة لموقع محمد منصور
-- نفّذ الملف ده مرة واحدة في Supabase: SQL Editor ثم Run
-- supabase/migrations/001_leads.sql

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- بيانات التواصل (من LeadGate)
  name text not null,
  phone text not null,

  -- مدخلات الحاسبة
  age int,
  gender text,
  height_cm numeric,
  weight_kg numeric,
  body_fat_pct numeric,
  activity_id text,
  activity_label text,
  goal_id text,
  goal_label text,

  -- النتائج
  bmr_mifflin int,
  bmr_harris int,
  bmr_katch int,
  tdee_mifflin int,
  tdee_harris int,
  tdee_katch int,
  target_calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
  calculated_at timestamptz
);

alter table public.leads enable row level security;

-- السماح للتطبيق (anon) بإضافة ليد جديد
drop policy if exists "anon insert leads" on public.leads;
create policy "anon insert leads"
  on public.leads for insert
  to anon
  with check (true);

-- السماح للتطبيق بتحديث نتيجة الحاسبة على نفس الصف
-- ملحوظة MVP: بدون تسجيل دخول، أي عميل يقدر يحدّث أي صف. هنشدّدها لاحقاً
-- (auth + phone OTP) مع نظام المتابعة.
drop policy if exists "anon update leads" on public.leads;
create policy "anon update leads"
  on public.leads for update
  to anon
  using (true)
  with check (true);

-- ملحوظة تصميم مقصودة: لا توجد SELECT policy حتى لا تكون الأسماء والأرقام
-- قابلة للقراءة العامة بمفتاح النشر. التسجيل يتم بصف واحد لكل عميل بدون أي SELECT:
-- 1) عند التسجيل: حفظ محلي فقط على جهاز العميل (بدون صف سحابي).
-- 2) عند أول حساب: INSERT واحد بالاسم والتليفون والمدخلات والنتيجة (id مولّد من العميل).
-- 3) عند إعادة الحساب: UPDATE لنفس الصف (id المحفوظ محلياً)، ولو لم يطابق
-- يتم INSERT صف جديد كبديل آمن. الربط بين الصفوف برقم التليفون (الأحدث هو الحالي).
-- كل القيم النصية بالعربي (النوع ذكر/أنثى + لابل النشاط والهدف).

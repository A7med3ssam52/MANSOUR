// طبقة الليدز - سحابي أولاً (Supabase) مع fallback محلي تلقائي
// صف واحد لكل عميل: التسجيل محلي فقط، وأول حساب يعمل INSERT كامل، وإعادة
// الحساب تعمل UPDATE لنفس الصف (مع بديل آمن: INSERT لو الـ UPDATE لم يطابق)
// كل القيم النصية المحفوظة سحابياً بالعربي (ذكر/أنثى + لابل النشاط والهدف)
// لو جدول leads مش موجود لسه أو الاتصال فشل، كل حاجة بتتحفظ على الجهاز بدون أي عطل
// src/services/leads.js
import { isCloudEnabled, supabase } from './supabaseClient'

const LEAD_KEY = 'mm_lead'
const RESULT_KEY = 'mm_result'

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
function normalizeDigits(str) {
  return String(str ?? '')
    .split('')
    .map((ch) => {
      const i = AR_DIGITS.indexOf(ch)
      return i >= 0 ? String(i) : ch
    })
    .join('')
    .trim()
}

export function validateEgyptianPhone(raw) {
  const phone = normalizeDigits(raw).replace(/[\s-]/g, '')
  if (!/^01[0125][0-9]{8}$/.test(phone)) {
    return 'اكتب رقم مصري صحيح يبدأ بـ 010 أو 011 أو 012 أو 015 (11 رقم)'
  }
  return null
}

export function normalizePhone(raw) {
  return normalizeDigits(raw).replace(/[\s-]/g, '')
}

function cacheLead(lead) {
  localStorage.setItem(LEAD_KEY, JSON.stringify(lead))
}

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `00000000-0000-4000-8000-${Date.now().toString(16)}${Math.random().toString(16).slice(2, 14)}`.slice(0, 36)
}

export async function saveLead({ name, phone }) {
  // التسجيل محلي فقط — الصف الوحيد في الداتابيز يتعمل عند أول حساب (اسم + تليفون + النتيجة)
  const lead = {
    id: genId(),
    name: name.trim(),
    phone: normalizePhone(phone),
    createdAt: new Date().toISOString(),
    cloud: false,
  }
  cacheLead(lead)
  return lead
}

export function getLead() {
  try {
    const raw = localStorage.getItem(LEAD_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveResult(result) {
  localStorage.setItem(RESULT_KEY, JSON.stringify({ ...result, savedAt: new Date().toISOString() }))
  // تحديث سحابي في الخلفية بدون تعطيل المستخدم
  persistResultCloud(result).catch(() => {})
}

async function persistResultCloud(result) {
  if (!isCloudEnabled || !supabase) return
  const lead = getLead()
  if (!lead?.id) return
  // كل القيم عربي في الداتابيز (النوع والنشاط والهدف بالعربي بدل male/sedentary/cut)
  const row = {
    name: lead.name,
    phone: lead.phone,
    age: result.age,
    gender: result.gender === 'male' ? 'ذكر' : 'أنثى',
    height_cm: result.heightCm,
    weight_kg: result.weightKg,
    body_fat_pct: result.bodyFatPct,
    activity_id: result.activityLabel,
    activity_label: result.activityLabel,
    goal_id: result.goalLabel,
    goal_label: result.goalLabel,
    bmr_mifflin: result.bmr?.mifflin ?? null,
    bmr_harris: result.bmr?.harris ?? null,
    bmr_katch: result.bmr?.katch ?? null,
    tdee_mifflin: result.tdeeMifflin,
    tdee_harris: result.tdeeHarris,
    tdee_katch: result.tdeeKatch,
    target_calories: result.targetCalories,
    protein_g: result.macros?.proteinG ?? null,
    carbs_g: result.macros?.carbsG ?? null,
    fat_g: result.macros?.fatG ?? null,
    calculated_at: new Date().toISOString(),
  }
  try {
    // صف واحد لكل عميل: إعادة الحساب تحدّث نفس الصف بدل صف جديد
    if (lead.rowId) {
      const { error, count } = await supabase.from('leads').update(row, { count: 'exact' }).eq('id', lead.rowId)
      if (!error && count !== 0) {
        lead.cloud = true
        cacheLead(lead)
        return
      }
      // الـ UPDATE لم يطابق (أو غير مدعوم) → نكمل لصف جديد كبديل آمن
    }
    const rowId = lead.rowId ?? genId()
    const { error } = await supabase.from('leads').insert({ id: rowId, ...row })
    if (error) throw error
    lead.rowId = rowId
    lead.cloud = true
    cacheLead(lead)
  } catch (err) {
    console.warn('Supabase saveResult skipped:', err?.message ?? err)
  }
}

export function getResult() {
  try {
    const raw = localStorage.getItem(RESULT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAll() {
  localStorage.removeItem(LEAD_KEY)
  localStorage.removeItem(RESULT_KEY)
}

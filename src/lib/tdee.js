export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'خامل (شغل مكتبي بدون رياضة)', factor: 1.2 },
  { id: 'light', label: 'نشاط خفيف (رياضة 1-3 أيام)', factor: 1.375 },
  { id: 'moderate', label: 'نشاط متوسط (رياضة 3-5 أيام)', factor: 1.55 },
  { id: 'active', label: 'نشاط عالي (رياضة 6-7 أيام)', factor: 1.725 },
  { id: 'extra', label: 'نشاط عنيف (شغل بدني + رياضة)', factor: 1.9 },
]

export const GOALS = [
  { id: 'maintain', label: 'ثبات الوزن', delta: 0, desc: 'سعرات الثبات اليومية' },
  { id: 'cut', label: 'تنشيف (خسارة ~0.5 كجم/أسبوع)', delta: -500, desc: 'عجز 500 سعرة' },
  { id: 'bulk', label: 'زيادة (زيادة تدريجية)', delta: 300, desc: 'فائض 300 سعرة' },
]

export function mifflinStJeor({ weightKg, heightCm, age, gender }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

export function harrisBenedict({ weightKg, heightCm, age, gender }) {
  if (gender === 'male') {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age
}

// تحتاج نسبة دهون صحيحة (0-60]. ترجع null لو غير متاحة
export function katchMcArdle({ weightKg, bodyFatPct }) {
  if (bodyFatPct == null || Number.isNaN(bodyFatPct) || bodyFatPct <= 0 || bodyFatPct > 60) {
    return null
  }
  const leanMass = weightKg * (1 - bodyFatPct / 100)
  return 370 + 21.6 * leanMass
}

export function getActivityFactor(activityId) {
  return ACTIVITY_LEVELS.find((a) => a.id === activityId)?.factor ?? 1.2
}

export function targetCalories(tdee, goalId) {
  const goal = GOALS.find((g) => g.id === goalId) ?? GOALS[0]
  return Math.round(tdee + goal.delta)
}

// حد أدنى آمن للتنشيف: الهدف لا ينزل تحت BMR ولا تحت 1200 سعرة.
// ترجع { target, capped } حتى نوضح للمستخدم أن الرقم اترفع للأمان.
export function safeTargetCalories(tdeePrecise, goalId, bmrPrecise) {
  const raw = targetCalories(tdeePrecise, goalId)
  if (goalId !== 'cut') return { target: raw, capped: false, floor: null }
  const floor = Math.max(1200, Math.round(bmrPrecise))
  if (raw < floor) return { target: floor, capped: true, floor }
  return { target: raw, capped: false, floor: null }
}

// بروتين حسب الهدف + دهون 27% من السعرات + الباقي كارب.
// مضمونة: proteinG*4 + carbsG*4 + fatG*9 === calories دائماً (عندما يكون ذلك ممكناً رياضياً).
export function calcMacros(calories, weightKg, goalId) {
  const target = Math.round(calories)
  const proteinPerKg = goalId === 'cut' ? 2.2 : goalId === 'bulk' ? 2.0 : 1.8
  const proteinG = Math.round(proteinPerKg * weightKg)

  // ابحث عن أقرب توزيعة تحقق المجموع بدقة:
  // الأولوية للبروتين المحسوب (dp=0)، ثم أقرب نسبة دهون لـ 27%
  const fatIdeal = Math.round(target * 0.27 / 9)
  for (let dp = 0; dp <= 12; dp++) {
    const pCands = dp === 0 ? [proteinG] : [proteinG - dp, proteinG + dp]
    for (const p of pCands) {
      if (p < 0) continue
      const r = target - p * 4
      if (r < 0) continue
      const fMax = Math.floor(r / 9)
      const f0 = Math.min(fatIdeal, fMax)
      const dfMax = Math.max(f0, fMax - f0)
      for (let df = 0; df <= dfMax; df++) {
        const fCands = df === 0 ? [f0] : [f0 - df, f0 + df]
        for (const f of fCands) {
          if (f < 0 || f > fMax) continue
          const rem = r - f * 9
          if (rem % 4 === 0) return { proteinG: p, fatG: f, carbsG: rem / 4 }
        }
      }
    }
  }
  // احتياطي لمدخلات متناقضة قصوى (بروتين مستحيل): انزل بالبروتين حتى توجد حل دقيق
  for (let p = Math.min(proteinG, Math.floor(target / 4)); p >= Math.max(0, Math.floor(target / 4) - 40); p--) {
    const r = target - p * 4
    for (let f = 0; f <= Math.min(12, Math.floor(r / 9)); f++) {
      if ((r - f * 9) % 4 === 0) return { proteinG: p, fatG: f, carbsG: (r - f * 9) / 4 }
    }
  }
  const fitProteinG = Math.max(0, Math.floor(target / 4))
  return { proteinG: fitProteinG, fatG: 0, carbsG: 0 }
}

export function calcAll({ weightKg, heightCm, age, gender, bodyFatPct, activityId }) {
  const bmrMifflin = mifflinStJeor({ weightKg, heightCm, age, gender })
  const bmrHarris = harrisBenedict({ weightKg, heightCm, age, gender })
  const bmrKatch = katchMcArdle({ weightKg, bodyFatPct })
  const factor = getActivityFactor(activityId)

  const tdeeMifflin = bmrMifflin * factor
  const tdeeHarris = bmrHarris * factor
  const tdeeKatch = bmrKatch != null ? bmrKatch * factor : null

  return {
    bmr: { mifflin: Math.round(bmrMifflin), harris: Math.round(bmrHarris), katch: bmrKatch != null ? Math.round(bmrKatch) : null },
    tdee: {
      mifflin: Math.round(tdeeMifflin),
      harris: Math.round(tdeeHarris),
      katch: tdeeKatch != null ? Math.round(tdeeKatch) : null,
    },
    activityFactor: factor,
    // قيم دقيقة غير مقربة — تُستخدم لحساب الهدف والماكروز (بدون تقريب مزدوج)
    precise: {
      bmr: { mifflin: bmrMifflin, harris: bmrHarris, katch: bmrKatch },
      tdee: { mifflin: tdeeMifflin, harris: tdeeHarris, katch: tdeeKatch },
    },
  }
}

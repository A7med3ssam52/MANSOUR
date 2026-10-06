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

// تحتاج نسبة دهون صحيحة (0-60). ترجع null لو غير متاحة
export function katchMcArdle({ weightKg, bodyFatPct }) {
  if (bodyFatPct == null || Number.isNaN(bodyFatPct) || bodyFatPct <= 0 || bodyFatPct >= 60) {
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

// بروتين حسب الهدف + دهون 27% من السعرات + الباقي كارب
export function calcMacros(calories, weightKg, goalId) {
  const proteinPerKg = goalId === 'cut' ? 2.2 : goalId === 'bulk' ? 2.0 : 1.8
  const proteinG = Math.round(proteinPerKg * weightKg)
  const fatCal = calories * 0.27
  const fatG = Math.round(fatCal / 9)
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4))
  return { proteinG, fatG, carbsG }
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
  }
}

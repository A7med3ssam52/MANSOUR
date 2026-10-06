// عميل Supabase - يعمل فقط عند وجود بيانات الاتصال في .env
// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const isCloudEnabled = Boolean(url && key)

export const supabase = isCloudEnabled ? createClient(url, key) : null

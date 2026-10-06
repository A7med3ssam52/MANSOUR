# محمد منصور — حاسبة السعرات + منصور بوت

## متغيرات البيئة (مطلوبة في Production مثل Vercel)

بدون `VITE_GEMINI_API_KEY` الشات بيشتغل بالردود المحلية البديلة. أضف في
Vercel → Settings → Environment Variables:

```
VITE_GEMINI_API_KEY=...        # مفتاح Gemini (لازم للردود الذكية)
VITE_GEMINI_MODEL=gemini-2.0-flash
VITE_SUPABASE_URL=...          # لحفظ الليدز
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

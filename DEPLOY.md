# 🚀 Desplegar Clinic AI gratis (Neon + Render + Vercel)

Stack 100% gratuito para poner el producto online y empezar a cobrar.
Coste fijo: **$0**. Solo pagas Anthropic por uso (y solo si desactivas el modo mock).

```
Frontend (Vercel)  ──API──▶  Backend (Render)  ──▶  PostgreSQL (Neon)
```

---

## 1. Base de datos — Neon (gratis, sin tarjeta)

1. Entra en https://neon.tech → **Sign up** (con GitHub).
2. **Create project** → nombre `clinic-ai` → región más cercana.
3. Copia el **connection string** (empieza por `postgresql://...`). Lo necesitas en el paso 2.
   - Usa el que dice "Pooled connection" si lo ofrece.

## 2. Backend — Render (plan free)

1. Entra en https://render.com → **Sign up** (con GitHub).
2. **New → Blueprint** → conecta tu repo `clinic-ai`. Render leerá `render.yaml`.
3. Cuando pida las variables (marcadas como *secret*), pon **como mínimo**:
   - `DATABASE_URL` = el connection string de Neon (paso 1)
   - `FRONTEND_URL` = lo rellenas en el paso 3 (deja un placeholder y edítalo luego)
   - `APP_BASE_URL` = la URL que te dé Render, p.ej. `https://clinic-ai-backend.onrender.com`
   - El resto puedes dejarlas vacías → el backend arranca en **modo mock** (gratis).
4. **Create** y espera al primer deploy. Las tablas se crean solas (`prisma migrate deploy`).
5. Verifica: abre `https://TU-BACKEND.onrender.com/health` → debe responder `{"status":"ok"}`.

> ⚠️ El plan free **duerme** tras 15 min sin tráfico; la primera petición tarda ~50s en despertar. Suficiente para validar; sube a plan de pago ($7/mes) cuando tengas clientes.

## 3. Frontend — Vercel (gratis, sin tarjeta)

1. Entra en https://vercel.com → **Sign up** (con GitHub).
2. **Add New → Project** → importa `clinic-ai`.
3. **Root Directory**: selecciona `frontend`.
4. En **Environment Variables** añade:
   - `VITE_API_URL` = la URL de tu backend en Render (p.ej. `https://clinic-ai-backend.onrender.com`)
5. **Deploy**. Te dará una URL tipo `https://clinic-ai.vercel.app`.
6. **Vuelve a Render** → edita `FRONTEND_URL` con esa URL de Vercel y guarda (re-deploya solo).

## 4. Comprobar que vive

- Abre `https://clinic-ai.vercel.app/landing` → la landing de ventas.
- Pulsa "Activar mi agente" → pon un email → activa (demo) → personaliza → entra al panel.
- Todo funciona en **modo mock** sin gastar un euro.

---

## 5. Encender lo real (cuando quieras cobrar de verdad)

Pon estas variables en **Render** y re-deploya. Cada una activa su función:

| Para cobrar / funcionar | Variables |
|---|---|
| 💳 **Stripe** (live) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL` |
| 🧠 **Anthropic** (IA real) | `ANTHROPIC_API_KEY` |
| 💬 **WhatsApp** | `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` |
| 📧 **Email** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` |

- **Stripe webhook**: en el dashboard de Stripe crea un endpoint → `https://TU-BACKEND.onrender.com/api/payments/webhook` → evento `checkout.session.completed`. Copia el signing secret a `STRIPE_WEBHOOK_SECRET`.
- **Stripe success/cancel**: apúntalas a tu dominio de Vercel.

Mientras una variable esté vacía o con marcador, esa pieza sigue en modo demo — el resto funciona igual.

---

## Resumen de cuentas a crear (todas gratis, sin tarjeta para empezar)
- [ ] Neon (base de datos)
- [ ] Render (backend)
- [ ] Vercel (frontend)
- [ ] (más tarde) Stripe, Anthropic, Meta WhatsApp, SendGrid/Resend

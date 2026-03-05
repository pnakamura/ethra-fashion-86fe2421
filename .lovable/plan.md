

# Password Reset Flow

## Current State
The Auth page has no "Forgot password?" option. There is no `/reset-password` route or page. The `useAuth` hook has no `resetPassword` method.

## Changes Required

### 1. Add `resetPassword` to `useAuth.tsx`
Add a function that calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })` and expose it in the context.

### 2. Add "Forgot password?" link to `Auth.tsx`
- Add a new state `isForgotPassword` for a third view mode
- When active, show only the email field + a "Send reset link" button
- On success, show a toast confirming the email was sent
- Show this link only when `isLogin` is true, below the password field

### 3. Create `/reset-password` page (`src/pages/ResetPassword.tsx`)
- Check URL hash for `type=recovery` (Supabase appends this)
- Show a form with new password + confirm password fields
- Call `supabase.auth.updateUser({ password })` on submit
- On success, redirect to `/`
- Public route (no auth guard)

### 4. Add route in `App.tsx`
Add `<Route path="/reset-password" element={<ResetPassword />} />` as a public route.

### 5. i18n keys in `auth.json` (PT-BR and EN-US)
New keys:
- `forgotPassword`: "Esqueceu a senha?" / "Forgot your password?"
- `resetPassword`: "Redefinir Senha" / "Reset Password"
- `sendResetLink`: "Enviar link de redefinição" / "Send reset link"
- `resetEmailSent` / `resetEmailSentDesc`: confirmation messages
- `newPassword` / `confirmPassword` / `passwordsDoNotMatch`
- `passwordUpdated` / `passwordUpdatedDesc`
- `backToLogin`: "Voltar ao login" / "Back to login"

### Files to Create/Edit (5 total)

| File | Change |
|------|--------|
| `src/hooks/useAuth.tsx` | Add `resetPassword` method |
| `src/pages/Auth.tsx` | Add forgot password view mode |
| `src/pages/ResetPassword.tsx` | New page for setting new password |
| `src/App.tsx` | Add `/reset-password` route |
| `src/i18n/locales/pt-BR/auth.json` | Add ~10 keys |
| `src/i18n/locales/en-US/auth.json` | Add ~10 keys |


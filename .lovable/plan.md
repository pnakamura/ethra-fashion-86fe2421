

# Corrigir Mistura de Idiomas na Landing Page + Verificar Acesso de Testers

## Problema
Três pontos de mistura de idiomas na tela de sucesso do cadastro de tester:

1. **`TesterSignupForm.tsx` linha 135**: `emailVerificationTitle` usa `defaultValue: 'Verifique seu e-mail'` (português hardcoded) — a chave não existe nos arquivos de locale
2. **`TesterSignupForm.tsx` linha 138**: `emailVerificationDesc` usa `defaultValue` com texto longo em português hardcoded — mesma situação
3. **`TesterSignupForm.tsx` linha 243**: aria-labels `'Ocultar senha' / 'Mostrar senha'` hardcoded em português

## Plano (3 arquivos)

### 1. `src/i18n/locales/pt-BR/landing.json`
Adicionar dentro de `signup`:
- `emailVerificationTitle`: "Verifique seu e-mail"
- `emailVerificationDesc`: "Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta e começar a explorar."
- `hidePassword`: "Ocultar senha"
- `showPassword`: "Mostrar senha"

### 2. `src/i18n/locales/en-US/landing.json`
Mesmas chaves em inglês:
- `emailVerificationTitle`: "Check your email"
- `emailVerificationDesc`: "We sent a confirmation link to your email. Click it to activate your account and start exploring."
- `hidePassword`: "Hide password"
- `showPassword`: "Show password"

### 3. `src/components/landing/TesterSignupForm.tsx`
- Linha 135: remover `defaultValue`, usar `t('signup.emailVerificationTitle')`
- Linha 138: remover `defaultValue`, usar `t('signup.emailVerificationDesc')`
- Linha 243: trocar strings hardcoded por `t('signup.hidePassword')` e `t('signup.showPassword')`

### 4. Teste do fluxo de acesso
Após as correções, testar via browser automation:
- Cadastrar novo tester em `/welcome`
- Verificar que a mensagem de sucesso aparece 100% no idioma correto
- Clicar em "Acesse sua conta" e fazer login
- Confirmar que o tester acessa o app normalmente


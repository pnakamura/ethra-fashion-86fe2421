

# Plano: Tema Claro como Padrão e Modo Escuro Exclusivo para Usuários Logados

## Resumo da Mudança

A solicitação envolve duas alterações fundamentais:

1. **Tema claro como padrão universal** - Independente da configuração do sistema do usuário, o app sempre iniciará em modo claro
2. **Modo escuro exclusivo para usuários cadastrados** - O toggle/opção de tema escuro só será visível e funcional para usuários autenticados

---

## Arquivos a Modificar

### 1. `src/App.tsx`
Alterar o `ThemeProvider` para usar `defaultTheme="light"` em vez de `"system"`:

```typescript
<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
```

Isso garante que todos os visitantes iniciam no tema claro.

---

### 2. `src/contexts/AccessibilityContext.tsx`
Modificar a lógica de carregamento de tema para:

- **Usuários não logados**: Forçar tema claro, ignorar localStorage
- **Usuários logados**: Carregar preferência salva (localStorage → banco)

```typescript
// Dentro de loadPreferences:
if (!user) {
  // Usuário não logado - forçar tema claro
  setTheme('light');
  setThemePreferenceState('light');
} else {
  // Usuário logado - carregar preferência salva
  const savedTheme = localStorage.getItem(THEME_KEY) as ThemePreference;
  if (savedTheme) {
    setThemePreferenceState(savedTheme);
    setTheme(savedTheme);
  }
  // ... resto da lógica de sync com banco
}
```

Também modificar `setThemePreference` para só permitir mudança se houver usuário:

```typescript
const setThemePreference = async (theme: ThemePreference) => {
  if (!user) {
    // Silenciosamente ignorar - usuário não pode mudar tema
    return;
  }
  // ... resto da lógica
};
```

---

### 3. `src/components/landing/HeroSection.tsx`
**Remover o botão de toggle de tema** da landing page, já que usuários não logados não podem alterar o tema:

```typescript
// REMOVER completamente o bloco:
{/* Theme toggle */}
<div className="absolute top-6 right-6 z-20">
  <Button ... />
</div>
```

---

### 4. `src/pages/Settings.tsx`
Adicionar condição para **ocultar as opções de tema** para usuários não logados (embora esta página já requer login, é uma proteção adicional):

A página de Settings já exige autenticação, então as opções de tema continuarão visíveis normalmente para usuários logados.

---

## Lógica Resumida

| Estado do Usuário | Tema Aplicado | Pode Alterar Tema? |
|-------------------|---------------|-------------------|
| Não logado | Claro (fixo) | ❌ Não |
| Logado (sem preferência) | Claro (padrão) | ✅ Sim |
| Logado (preferência dark) | Escuro | ✅ Sim |
| Logado (preferência system) | Depende do SO | ✅ Sim |

---

## Fluxo de Experiência

```text
1. Visitante acessa /welcome
         ↓
2. Tema é forçado para CLARO
   (botão de toggle não aparece)
         ↓
3. Visitante faz login/cadastro
         ↓
4. Sistema carrega preferência do banco
   (ou mantém claro se primeira vez)
         ↓
5. Em /settings, usuário pode:
   - Escolher "Sistema", "Claro" ou "Escuro"
   - Preferência é salva no banco
```

---

## Seção Técnica

### Alteração no ThemeProvider (App.tsx)

```typescript
// ANTES:
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>

// DEPOIS:
<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
```

A mudança de `enableSystem={false}` previne que o tema do sistema operacional seja aplicado automaticamente.

### Alteração no AccessibilityContext

```typescript
useEffect(() => {
  const loadPreferences = async () => {
    // Para usuários não logados, sempre forçar tema claro
    if (!user) {
      setTheme('light');
      setThemePreferenceState('light');
      setIsLoading(false);
      return;
    }

    // Apenas para usuários logados: carregar preferências
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize;
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemePreference;
    // ... resto do código
  };
  
  loadPreferences();
}, [user, setTheme]);
```

### Alteração na HeroSection

```typescript
// Remover completamente:
// - import do useTheme
// - const { resolvedTheme, setTheme } = useTheme();
// - const toggleTheme = () => { ... };
// - O JSX do botão de toggle
```

---

## Benefícios

1. **Consistência visual** - Todos os visitantes veem a mesma experiência inicial
2. **Performance** - Sem flash de tema incorreto no carregamento
3. **Exclusividade** - Modo escuro como "feature" para usuários cadastrados
4. **Simplicidade** - Landing page mais limpa sem toggle de tema


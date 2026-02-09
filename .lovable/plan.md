

# Plano: Background Abstract como Padrão no Tema Claro

## Problema Identificado

Atualmente, o `defaultSettings` no `BackgroundSettingsContext.tsx` define:

```typescript
light: {
  variant: 'none',  // ❌ Sem background no tema claro
  opacity: 0.15,
}
```

Isso faz com que o tema claro não exiba nenhum background artístico por padrão.

---

## Solução

Alterar o `defaultSettings` para que o modo **light** use a variante **abstract** por padrão:

```typescript
light: {
  variant: 'abstract',  // ✅ Background abstract no tema claro
  opacity: 0.15,        // Opacidade sutil para não atrapalhar leitura
}
```

---

## Arquivo a Modificar

**`src/contexts/BackgroundSettingsContext.tsx`**

### Alteração 1: `defaultSettings` (linha 30-41)

```typescript
// ANTES:
const defaultSettings: BackgroundSettings = {
  dark: {
    variant: 'abstract',
    opacity: 0.30,
    customImageUrl: undefined,
  },
  light: {
    variant: 'none',        // ❌
    opacity: 0.15,
    customImageUrl: undefined,
  },
};

// DEPOIS:
const defaultSettings: BackgroundSettings = {
  dark: {
    variant: 'abstract',
    opacity: 0.30,
    customImageUrl: undefined,
  },
  light: {
    variant: 'abstract',    // ✅
    opacity: 0.15,
    customImageUrl: undefined,
  },
};
```

### Alteração 2: Fallback no carregamento do localStorage (linhas 61, 66, 86)

Atualizar os valores de fallback para garantir consistência:

```typescript
// localStorage v2 fallback
variant: parsed.light?.variant || 'abstract',  // era 'none'

// Migração do formato antigo
light: {
  variant: 'abstract',  // era 'none'
  opacity: 0.15,
  customImageUrl: undefined,
},

// Database fallback
variant: dbSettings.light?.variant || 'abstract',  // era 'none'
```

---

## Resultado Esperado

| Estado | Background Light Mode |
|--------|----------------------|
| Visitante (novo) | abstract-light.jpeg com 15% opacidade |
| Usuário sem preferência | abstract-light.jpeg com 15% opacidade |
| Usuário com preferência | Configuração salva respeitada |

---

## Imagem Utilizada

O arquivo `/images/backgrounds/abstract-light.jpeg` já existe e será usado automaticamente pelo componente `ArtBackground.tsx`.


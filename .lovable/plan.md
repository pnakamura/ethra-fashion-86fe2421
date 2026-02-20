
# Add Language Selector to /welcome Page

## What will be added

A compact language toggle (PT / EN) positioned in the top-right corner of the landing page, next to the existing theme toggle (sun/moon switch). Clicking each option switches the entire page language instantly.

## Design

The selector will be two small pill buttons side by side showing the country flags (or text "PT" / "EN"), with the active language highlighted. It sits to the left of the theme toggle in the fixed top-right toolbar.

```text
 [ PT | EN ]   [sun] [switch] [moon]
```

## Technical Details

### File: `src/components/landing/BetaHero.tsx`

- Import `useTranslation` (already imported) and use `i18n.changeLanguage()`
- Add a language toggle next to the theme switch in the fixed top-right bar
- Active language gets `bg-primary text-primary-foreground` styling; inactive gets ghost styling
- On click, calls `i18n.changeLanguage('pt-BR')` or `i18n.changeLanguage('en-US')` and persists via `localStorage.setItem('ethra-locale', lng)`
- Current language detected from `i18n.language`

### UI Component

```text
<div className="fixed top-6 right-6 z-50 flex items-center gap-3">
  {/* Language toggle */}
  <div className="flex items-center rounded-full border ...">
    <button onClick={() => switchLang('pt-BR')} className={active/inactive}>PT</button>
    <button onClick={() => switchLang('en-US')} className={active/inactive}>EN</button>
  </div>

  {/* Existing theme toggle */}
  <Sun /> <Switch /> <Moon />
</div>
```

### No new files needed
- No new translation keys required (the toggle uses "PT" and "EN" labels which are language-agnostic)
- No backend changes

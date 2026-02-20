
# Traducao Completa: Fases 3 e 4

## Diagnostico

A infraestrutura i18n funciona corretamente. Os componentes ja traduzidos (Header, BottomNav, QuickActions, Index, Auth, Settings) alternam entre PT-BR e EN-US sem problemas. Porem, **todas as outras paginas e componentes permanecem 100% em portugues hardcoded**, independente da selecao de idioma.

**Impacto na versao PT-BR:** Nenhum. Os arquivos JSON de PT-BR contem exatamente os mesmos textos que hoje estao hardcoded. A substituicao de `"Texto"` por `t('chave')` carrega o mesmo texto do JSON quando o idioma e portugues. A unica diferenca e que o texto vem de um arquivo externo ao inves de estar embutido no codigo.

---

## Paginas e Componentes a Traduzir

### Fase 3A -- Wardrobe (8 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Wardrobe.tsx` | "Meu Closet", "Closet de X", "itens", "Todas", "Roupas", "Calcados", "Acessorios", "Joias", "Ideais", "Neutras", "Evitar", "Nova", "Upgrade", "Buscar pecas...", "Capsula", toasts |
| `AddItemSheet.tsx` | Labels de formulario, categorias |
| `EditItemSheet.tsx` | Labels de formulario |
| `WardrobeEmptyState.tsx` | Textos de estado vazio |
| `WardrobeItemCard.tsx` | Labels de acoes |
| `WardrobeGrid.tsx` | (se houver) |
| `CapsuleGuide.tsx` | Textos guia |
| `CapsuleHealthCard.tsx` | Textos de saude da capsula |
| `CompatibilityBadge.tsx` | Labels de compatibilidade |

Criar: `wardrobe.json` (PT-BR e EN-US)

### Fase 3B -- Chromatic (16 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Chromatic.tsx` | "Cores", "Descobrir", "Paleta", "Beauty", "Explorar", "Faca login..." |
| `ChromaticHero.tsx` | Textos do hero |
| `ChromaticOnboarding.tsx` | Textos de onboarding |
| `ColorAnalysis.tsx` | Labels da analise |
| `ColorAnalysisResult.tsx` | Resultados |
| `ColorPalette.tsx` | Labels |
| `ColorJourney.tsx` | Jornada |
| `SeasonExplorer.tsx` | Explorador |
| `SeasonDetailModal.tsx` | Detalhes |
| `SeasonSelector.tsx` | Seletor |
| `MakeupHub.tsx` | Hub de makeup |
| `QuickActionsGrid.tsx` | Acoes rapidas |
| `TemporarySeasonBanner.tsx` | Banner temporario |
| `TemporaryPalettePreview.tsx` | Preview |
| `EnhancedSeasonCard.tsx` | Card de estacao |
| `ChromaticCameraCapture.tsx` | Camera |

Criar: `chromatic.json` (PT-BR e EN-US)

### Fase 3C -- Virtual Try-On (15 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `VirtualTryOn.tsx` | "Provador Virtual", "Flash (Rapido)", "Pro (Balanceado)", "Premium (Qualidade)", "Provar", "Benchmark", "experimente!", "Peca selecionada", "Do seu closet", etc. |
| `AvatarManager.tsx` | Labels de avatar |
| `TryOnCanvas.tsx` | Labels do canvas |
| `TryOnOptions.tsx` | Opcoes |
| `GarmentCapture.tsx` | Captura |
| `WardrobeSelector.tsx` | Seletor |
| `LookSelector.tsx` | Seletor de look |
| `TryOnGallery.tsx` | Galeria |
| `TryOnDetailModal.tsx` | Modal |
| `BatchTryOnProgress.tsx` | Progresso |
| `ModelBenchmark.tsx` | Benchmark |
| `SmartCameraCapture.tsx` | Camera |
| `PrivacySettings.tsx` | Privacidade |
| `ComposeLookWarning.tsx` | Aviso |

Criar: `tryOn.json` (PT-BR e EN-US)

### Fase 3D -- Recommendations (7 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Recommendations.tsx` | "Todos", "Casual", "Trabalho", "Festa", "Formal", "Gerar Look", "Meu Closet", "Provar", "Apenas Capsula", "Looks sugeridos", "Nenhum look gerado ainda", "Descubra sua paleta primeiro", "Harmonia", "Looks Exclusivos", "Sua paleta cromatica", etc. |
| `LookCard.tsx` | Labels |
| `LookCardCompact.tsx` | Labels |
| `HarmonyStats.tsx` | Estatisticas |
| `VIPLookCard.tsx` | Labels VIP |
| `VIPLockedOverlay.tsx` | Overlay |
| `LookHarmonyBadge.tsx` | Badge |

Criar: `recommendations.json` (PT-BR e EN-US)

### Fase 3E -- Events (6 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Events.tsx` | "Agenda", "Reuniao", "Festa", "Encontro", "Entrevista", "Casamento", "Viagem", "Trabalho", "Especial", "Evento excluido", "Nenhum evento neste dia", "Proximos eventos", "Nenhum evento agendado", "Adicionar Evento", dias da semana `['D','S','T','Q','Q','S','S']`, `ptBR` hardcoded no date-fns |
| `AddEventSheet.tsx` | Labels de formulario |
| `EditEventSheet.tsx` | Labels |
| `EventDetailSheet.tsx` | Detalhes |
| `EventLookSuggestion.tsx` | Sugestoes |
| `EventPlanner.tsx` | Planejador |

Criar: `events.json` (PT-BR e EN-US)
Importante: substituir `{ locale: ptBR }` por `{ locale: dateFnsLocale }` do `useLocale()`

### Fase 3F -- Voyager (11 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Voyager.tsx` | "Voyager", "Viagem criada!", "Erro ao criar viagem", "Viagem excluida!", "PDF gerado!", "Abrindo Google Calendar...", categorias de packing list |
| `TripPlanner.tsx` | Formulario de planejamento |
| `TripList.tsx` | Lista de viagens |
| `TripCard.tsx` | Card |
| `TripDetailSheet.tsx` | Detalhes |
| `TripBrief.tsx` | Resumo |
| `TripReport.tsx` | Relatorio |
| `PackingChecklist.tsx` | Checklist ("roupas", "calcados", "acessorios", "chapeus") |
| `WeatherPreview.tsx` | Previsao |
| `SuggestedLooks.tsx` | Looks sugeridos |
| `MissingItemsSuggestion.tsx` | Sugestoes |
| `LocationPicker.tsx` | Seletor |

Criar: `voyager.json` (PT-BR e EN-US)

### Fase 3G -- Quiz + Onboarding (16 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Onboarding.tsx` | "Carregando..." |
| `WelcomeScreen.tsx` | "Bem-vindo(a) ao", descricoes |
| `NameInput.tsx` | Labels |
| `StyleSelector.tsx` | Estilos |
| `PainPointSelector.tsx` | Pontos de dor |
| `ColorTeaser.tsx` | Teaser |
| `WelcomeComplete.tsx` | Conclusao |
| `Quiz.tsx` / `StyleQuiz.tsx` | Paginas de quiz |
| `QuizStep.tsx` | Step |
| `QuizAesthetics.tsx` | Esteticas |
| `QuizSilhouette.tsx` | Silhuetas |
| `QuizSkinTone.tsx` | Tons de pele |
| `QuizPainPoints.tsx` | Pontos de dor |
| `QuizResult.tsx` | Resultado |
| `DNAReveal.tsx` | Revelacao DNA |
| `AestheticPicker.tsx` / `SilhouettePicker.tsx` / `PainPointPicker.tsx` | Pickers |

Criar: `quiz.json` e `onboarding.json` (PT-BR e EN-US)

### Fase 3H -- Landing Page (10 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Landing.tsx` | "Carregando..." |
| `BetaHero.tsx` | "Colorimetria por IA", "Provador Virtual", "Closet Inteligente" + descricoes, CTA |
| `DemoSection.tsx` | Secao demo |
| `TesterSignupForm.tsx` | Formulario |
| `Footer.tsx` | Rodape |
| `ChromaticSim.tsx` | Simulador |
| `ClosetSim.tsx` | Simulador |
| `TryOnSim.tsx` | Simulador |

Criar: `landing.json` (PT-BR e EN-US)

### Fase 3I -- Subscription (5 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Subscription.tsx` | Nomes de planos fallback, FAQs inteiras, "Escolha seu plano", "Desbloqueie recursos premium", "Voltar", "Inicio", "Seu uso atual", "Comparativo de recursos", "Perguntas frequentes", trust signals |
| `PricingCard.tsx` | Labels de preco |
| `UsageIndicator.tsx` | Indicador |
| `FeatureGate.tsx` | Gate |
| `LockedFeaturePage.tsx` | Pagina bloqueada |

Criar: `subscription.json` (PT-BR e EN-US)

### Fase 3J -- Admin (5 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `Admin.tsx` | Labels de admin |
| `UserManagement.tsx` | Gestao |
| `UserDetailSheet.tsx` | Detalhes |
| `FeatureFlagsSettings.tsx` | Flags |
| `SubscriptionManagement.tsx` | Gestao de assinatura |

Criar: `admin.json` (PT-BR e EN-US)

### Fase 3K -- Dashboard sub-components (3 arquivos)

| Arquivo | Strings hardcoded |
|---------|-------------------|
| `LookOfTheDay.tsx` | "Look do Dia", "Gerar look", "Ver mais", etc. |
| `MissionCard.tsx` | "Parabens, Mestre do Estilo!", categorias de missao |
| `AchievementsPanel.tsx` | Labels de conquistas |

Atualizar: `dashboard.json` com chaves adicionais

### Fase 4A -- Paginas Juridicas (3 arquivos)

| Arquivo | Acao |
|---------|------|
| `Terms.tsx` | Refatorar para carregar conteudo de `legal.json` (PT-BR: LGPD/CDC, EN-US: CCPA/general) |
| `PrivacyPolicy.tsx` | Idem |
| `Privacy.tsx` | Verificar e traduzir |

### Fase 4B -- Dados e Utilitarios (5 arquivos)

| Arquivo | Acao |
|---------|------|
| `normalize-color.ts` | Adicionar dicionario EN-US de nomes de cores |
| `missions.ts` | Traduzir titulos e descricoes de missoes |
| `chromatic-seasons.ts` | Traduzir nomes de estacoes e descricoes |
| `quiz-aesthetics.ts` | Traduzir esteticas |
| `PageLoader.tsx` / `EmptyState.tsx` | Usar `t()` |

---

## Garantia de Seguranca para PT-BR

A abordagem e segura porque:

1. Cada string hardcoded em portugues sera movida para o JSON `pt-BR` **com o mesmo texto exato**
2. A chave `t('wardrobe.title')` retorna `"Meu Closet"` em PT-BR e `"My Closet"` em EN-US
3. O fallback e `pt-BR`, entao qualquer chave nao traduzida mostra o portugues original
4. Os componentes ja traduzidos (Header, BottomNav, etc.) comprovam que a abordagem funciona sem quebrar nada

---

## Ordem de Implementacao Sugerida

Devido ao volume (~80 arquivos), sugiro implementar em blocos de 2-3 fases por prompt:

**Bloco 1 (impacto visual maximo):**
- Fase 3A (Wardrobe) + Fase 3D (Recommendations) + Fase 3K (Dashboard sub-components)

**Bloco 2:**
- Fase 3B (Chromatic) + Fase 3C (Try-On)

**Bloco 3:**
- Fase 3E (Events) + Fase 3F (Voyager)

**Bloco 4:**
- Fase 3G (Quiz/Onboarding) + Fase 3H (Landing)

**Bloco 5:**
- Fase 3I (Subscription) + Fase 3J (Admin)

**Bloco 6:**
- Fase 4A (Juridicas) + Fase 4B (Utilitarios)

Cada bloco cria os JSONs de traducao necessarios e refatora os componentes para usar `t()`.

---
name: fashion-frontend
description: Create premium fashion app interfaces with distinctive aesthetics inspired by leading apps like SHEIN, Zara, Farfetch, and ASOS. Use this skill when building fashion e-commerce apps, clothing marketplaces, virtual closet apps, colorimetry/personal styling apps, or any fashion-related mobile/web interfaces. Covers product galleries, try-on experiences, outfit builders, style recommendations, and fashion social features.
---

# Fashion Frontend Design Skill

Create distinctive, high-converting fashion app interfaces that blend editorial elegance with seamless shopping experiences.

## Design Philosophy

Fashion apps exist at the intersection of visual storytelling and frictionless commerce. Every pixel must serve both brand expression and conversion optimization.

### Core Principles

1. **Product Hero** — Let garments breathe. Generous whitespace, full-bleed imagery, minimal UI chrome
2. **Editorial Feel** — Channel fashion magazine layouts: asymmetric grids, bold typography, curated curation
3. **Tactile Luxury** — Subtle shadows, glassmorphism, micro-animations that feel premium
4. **Effortless Discovery** — Infinite scroll, swipe gestures, visual search over text-heavy navigation

## Aesthetic Directions

Choose ONE direction per project and commit fully:

| Direction | Characteristics | Inspiration |
|-----------|----------------|-------------|
| **Minimalist Luxury** | Crisp whites, thin serifs, ample negative space | Zara, COS, Everlane |
| **Bold Street** | High contrast, chunky type, neon accents | ASOS, StockX, Depop |
| **Soft Editorial** | Warm neutrals, elegant serifs, magazine layouts | Farfetch, Net-a-Porter |
| **Gen-Z Vibrant** | Playful gradients, rounded corners, emoji integration | SHEIN, Cider, Romwe |
| **Sustainable Organic** | Earth tones, natural textures, muted palettes | Vinted, Patagonia |

## Typography Guidelines

### Display Fonts (Headlines, Product Names)
- **Luxury**: Playfair Display, Cormorant Garamond, Bodoni Moda
- **Modern**: PP Neue Montreal, Satoshi, General Sans
- **Editorial**: Freight Display, Canela, Tiempos Headline
- **Bold/Street**: Clash Display, Cabinet Grotesk, Obviously

### Body Fonts
- **Readable Elegance**: Source Serif Pro, Spectral, Libre Baskerville
- **Clean Modern**: DM Sans, Plus Jakarta Sans, Outfit

**AVOID**: Inter, Roboto, Arial, system fonts — these scream generic

## Color Strategies

### Primary Palettes by Direction

```css
/* Minimalist Luxury */
--luxury-bg: #FAFAFA;
--luxury-text: #1A1A1A;
--luxury-accent: #C9A962;
--luxury-muted: #8B8B8B;

/* Bold Street */
--street-bg: #0D0D0D;
--street-text: #FFFFFF;
--street-accent: #00FF94;
--street-secondary: #FF3366;

/* Soft Editorial */
--editorial-bg: #F5F0EB;
--editorial-text: #2C2825;
--editorial-accent: #9B6B4A;
--editorial-muted: #B8AEA2;

/* Gen-Z Vibrant */
--genz-bg: #FFFFFF;
--genz-primary: #FF2D55;
--genz-gradient: linear-gradient(135deg, #FF6B9D 0%, #C44EFF 100%);
--genz-yellow: #FFE135;

/* Sustainable Organic */
--eco-bg: #F7F4F0;
--eco-text: #3D3D3D;
--eco-accent: #5B7553;
--eco-warm: #C4A77D;
```

## Key Features to Implement

### 1. Product Gallery Grid
- Masonry or Pinterest-style layouts for visual interest
- Lazy loading with skeleton placeholders
- Quick-view on hover/long-press
- Heart/save button with satisfying animation

### 2. Product Detail Page
- Full-screen hero image carousel
- Sticky add-to-bag bar on scroll
- Size guide modal with body measurements
- "Complete the Look" recommendations
- User-generated content section

### 3. Discovery & Navigation
- Visual category navigation (not text-heavy dropdowns)
- "Shop by Occasion/Mood" curated collections
- Trending/Viral section with social proof
- Recently viewed carousel

### 4. Cart & Checkout
- Slide-in drawer cart (not full page redirect)
- Stock urgency indicators ("Only 3 left!")
- Estimated delivery with visual timeline
- One-tap checkout with saved preferences

### 5. Personalization Features
- Style quiz onboarding
- AI-powered recommendations
- "For You" feed with swipe interactions
- Saved style profiles

## Animation Guidelines

### Micro-interactions
```css
/* Product card hover */
.product-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.product-card:hover {
  transform: translateY(-8px);
}

/* Heart animation */
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(0.95); }
  75% { transform: scale(1.1); }
}

/* Add to bag success */
@keyframes bagPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
```

### Page Transitions
- Staggered fade-in for product grids (50-100ms delay per item)
- Smooth image zoom on detail view entry
- Slide-up for modals and drawers
- Crossfade for image carousels

## Mobile-First Considerations

Fashion apps are 85%+ mobile traffic. Prioritize:

- **Thumb zones** — Primary actions in bottom 40% of screen
- **Swipe patterns** — Image galleries, product comparison, dismissal
- **Bottom navigation** — Home, Search, Wishlist, Bag, Profile
- **Pull-to-refresh** — For feeds and discovery pages
- **Haptic feedback** — On add-to-bag, wishlist, checkout success

## Dark Mode Implementation

Essential for modern fashion apps:
- Invert backgrounds, maintain brand accent colors
- Product images remain unaffected
- Reduce blue light for evening browsing
- Offer auto-switch based on system preference

## Accessibility Requirements

Fashion must be inclusive:
- Alt text describing garment color, style, and key features
- Color swatches with text labels (not color-only)
- Touch targets minimum 44x44px
- Screen reader announcements for cart updates
- Keyboard navigation for desktop

## Performance Optimization

Fashion imagery is heavy. Optimize with:
- WebP/AVIF formats with JPEG fallback
- Responsive images (`srcset`) for device density
- Blur-up placeholders while loading
- Intersection Observer for lazy loading

## Implementation Workflow

1. **Define aesthetic direction** — Pick one from table above
2. **Set typography scale** — Display, heading, body, caption sizes
3. **Establish color tokens** — CSS variables for theming
4. **Build component library** — Cards, buttons, inputs, modals
5. **Assemble page templates** — Home, PLP, PDP, Cart, Checkout
6. **Add animations** — Micro-interactions, transitions
7. **Test on real devices** — Especially mobile Safari/Chrome
8. **Dark mode pass** — Verify all components adapt

## References

- `references/component-patterns.md` — Detailed React/CSS component examples

## Anti-Patterns to Avoid

❌ Cluttered product cards with too much text
❌ Tiny touch targets for mobile filters
❌ Auto-playing video that can't be paused
❌ Popup newsletters on first visit
❌ Horizontal scrolling for critical navigation
❌ Low-contrast text on image backgrounds
❌ Generic stock photography instead of styled product shots
❌ Purple gradients on white (overused AI aesthetic)

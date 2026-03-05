

# Fix: Wardrobe items not appearing in Try-On closet tab

## Root Cause

All 4 wardrobe items for the current user have base64 strings stored directly in the `image_url` field (ranging from 122KB to 2.8MB). The previous fix added a filter to skip base64 items to prevent JSON parse crashes, but this filtering removes ALL items since none have proper Storage URLs.

## Solution

Instead of filtering out base64 items (which breaks users who only have base64 items), handle the problem more gracefully:

1. **Remove the base64 filter** from `useWardrobeItems.ts` — the optimized column selection already prevents the JSON parse crash (the crash was caused by `select('*')` pulling all columns including large ones)
2. The current `select(...)` with specific columns already mitigates the payload size issue since it no longer pulls unexpected large fields

### File Changes

| File | Change |
|------|--------|
| `src/hooks/useWardrobeItems.ts` | Remove the base64 filter on lines 48-55 (and the equivalent on line 126). The specific column select already solves the JSON crash. |

### Why this is safe
- The JSON parse crash was caused by `select('*')` pulling all columns, creating a massive payload. The optimized column list already limits payload size.
- Base64 strings in `image_url` are functional (they render as images), just not ideal for performance.
- A future improvement should migrate these base64 values to Storage, but blocking display is worse than slow loading.


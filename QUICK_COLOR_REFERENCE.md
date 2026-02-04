# Quick Color Reference - Refined Palette

## Use This for Development

### Primary Colors - Use These in CSS

```css
/* Navy (Primary Brand Color) */
color: var(--brand);          /* #0A1E33 - Deep calm navy */

/* Blue (Secondary / Links) */
color: var(--brand-2);        /* #5FA8E6 - Soft refined blue */

/* Gold (Accents / Premium) */
color: var(--accent);         /* #C9A23F - Warm refined gold */
```

### Background Colors - Use These in CSS

```css
/* Main Page Background */
background-color: var(--surface);    /* #F1F4F8 - Soft marble */

/* Card / Component Background */
background-color: var(--surface-2);  /* #E9EDF3 - Marble surface */

/* Border / Divider Background */
background-color: var(--surface-3);  /* #DDE3EA - Soft depth */
```

### Text Colors - Use These in CSS

```css
/* Main Body Text */
color: var(--text-1);         /* #0B1F33 - Dark navy */

/* Labels / Secondary Text */
color: var(--text-2);         /* #5F6B7A - Cool gray-blue */

/* Hints / Muted Text */
color: var(--text-3);         /* #8B95A5 - Light muted */

/* Text on Dark Backgrounds */
color: var(--text-invert);    /* #FFFFFF - White */
```

### Shadow System - Pre-defined Utility Classes

```css
/* Use Tailwind shadow utilities */
.shadow-soft        /* 0 4px 12px rgba(10, 30, 51, 0.12) */
.shadow-soft-md     /* 0 8px 20px rgba(10, 30, 51, 0.16) */
.shadow-elevated    /* 0 12px 32px rgba(10, 30, 51, 0.18) */
.shadow-elevated-lg /* 0 20px 56px rgba(10, 30, 51, 0.22) */
```

---

## Hex Values Quick Lookup

### Core Palette
| Element | Hex Value |
|---------|-----------|
| Primary Navy | **#0A1E33** |
| Secondary Blue | **#5FA8E6** |
| Accent Gold | **#C9A23F** |
| Main BG | **#F1F4F8** |
| Card BG | **#E9EDF3** |
| Depth Layer | **#DDE3EA** |
| Primary Text | **#0B1F33** |
| Secondary Text | **#5F6B7A** |
| Muted Text | **#8B95A5** |

### Dark Mode (Added)
| Element | Hex Value |
|---------|-----------|
| Dark Surface | **#0A1E33** |
| Dark Surface 2 | **#102A45** |
| Dark Text | **#F1F4F8** |

---

## DO's & DON'Ts

### ✅ DO
- Use CSS variables: `color: var(--brand)`
- Use Tailwind utilities: `bg-surface text-text-1`
- Use the refined palette colors
- Use fallback colors when needed: `var(--primary, #C9A23F)`

### ❌ DON'T
- **NEVER** hardcode old colors: `#0A2540`, `#4DA3FF`, `#D4AF37`
- **NEVER** use pure white: `#FFFFFF` (use `#F1F4F8` instead)
- **NEVER** use bright blue: `#4DA3FF` (use `#5FA8E6` instead)
- **NEVER** use old gold: `#D4AF37` (use `#C9A23F` instead)

---

## Common Use Cases

### Button Styling
```css
.button {
  background: var(--brand);           /* Navy background */
  color: white;                       /* White text */
  box-shadow: 0 4px 12px rgba(10, 30, 51, 0.12);  /* Soft shadow */
}

.button:hover {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-3) 100%);
  box-shadow: 0 8px 20px rgba(10, 30, 51, 0.16);  /* Elevated shadow */
}
```

### Card Styling
```css
.card {
  background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
  border: 1px solid rgba(10, 30, 51, 0.08);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(10, 30, 51, 0.12);
}

.card:hover {
  box-shadow: 0 8px 20px rgba(10, 30, 51, 0.16);
}
```

### Text Styling
```css
.heading {
  color: var(--text-1);       /* Primary text - #0B1F33 */
  font-weight: 600;
}

.subtext {
  color: var(--text-2);       /* Secondary text - #5F6B7A */
  font-weight: 400;
}

.muted {
  color: var(--text-3);       /* Muted text - #8B95A5 */
  font-weight: 300;
}
```

### Form Input Styling
```css
.input {
  background: var(--surface);  /* Marble background */
  color: var(--text-1);        /* Dark text */
  border: 1px solid rgba(10, 30, 51, 0.08);
}

.input:focus {
  border-color: var(--brand-2);  /* Blue focus - #5FA8E6 */
  box-shadow: 0 0 0 3px rgba(95, 168, 230, 0.1);
}
```

### Accent/Highlight Styling
```css
.highlight {
  color: var(--accent);       /* Gold accent - #C9A23F */
  background: rgba(201, 162, 63, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
}
```

---

## CSS Variables File Location

**Master File**: `app/globals.css` (Lines 1-150)

All CSS variables are defined in the `:root` selector. Update this file if colors need to change globally.

---

## Tailwind Integration

**Extended Tailwind Colors**: `tailwind.config.ts`

All custom colors are available as Tailwind utilities:

```html
<!-- Background -->
<div class="bg-surface">Content</div>
<div class="bg-surface-2">Content</div>

<!-- Text -->
<p class="text-text-1">Primary text</p>
<p class="text-text-2">Secondary text</p>

<!-- Shadow -->
<div class="shadow-soft">Soft shadow</div>
<div class="shadow-elevated">Elevated shadow</div>
```

---

## Migration Notes

This refined palette replaces the original luxury marble colors:
- **Old Navy** (#0A2540) → **New Navy** (#0A1E33) - Deeper, calmer
- **Old Blue** (#4DA3FF) → **New Blue** (#5FA8E6) - Softer, refined
- **Old Gold** (#D4AF37) → **New Gold** (#C9A23F) - Warmer, more elegant

All CSS files have been updated. No further migrations needed.

---

## Questions?

Refer to:
- **Full Details**: `COLOR_REFINEMENT_SUMMARY.md`
- **Completion Report**: `REFINEMENT_COMPLETION_REPORT.md`
- **Original Design System**: `DESIGN_SYSTEM.md`

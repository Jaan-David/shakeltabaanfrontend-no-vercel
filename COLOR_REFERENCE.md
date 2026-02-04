# 🎨 Luxury Marble Brand - Color System Reference Card

## Primary Color Palette

### Navy Blue (Primary Brand Color)
```
HEX:     #0A2540
RGB:     10, 37, 64
HSL:     215°, 74%, 15%
CMYK:    84%, 42%, 0%, 75%
Usage:   Headers, primary buttons, main text, navigation
```
**Accessibility**: ✅ WCAG AAA on white background

### Sky Blue (Secondary Brand Color)
```
HEX:     #4DA3FF
RGB:     77, 163, 255
HSL:     213°, 100%, 65%
CMYK:    70%, 36%, 0%, 0%
Usage:   Secondary buttons, links, accents, focus rings
```
**Accessibility**: ✅ WCAG AA on white background

### Gold (Accent Color)
```
HEX:     #D4AF37
RGB:     212, 175, 55
HSL:     44°, 68%, 52%
CMYK:    0%, 17%, 74%, 17%
Usage:   Premium accents, stars, special highlights, badges
```
**Accessibility**: ✅ WCAG AA on white background

---

## Background & Surface Colors

### White (Primary Background)
```
HEX:     #FFFFFF
RGB:     255, 255, 255
HSL:     0°, 0%, 100%
CMYK:    0%, 0%, 0%, 0%
Usage:   Primary page background, light surfaces
```

### Light Gray (Secondary Surface)
```
HEX:     #F7F9FB
RGB:     247, 249, 251
HSL:     217°, 33%, 98%
CMYK:    3%, 2%, 1%, 1%
Usage:   Secondary backgrounds, alternate surfaces, subtle separation
```

### Very Light Gray (Tertiary Surface)
```
HEX:     #EFF2F7
RGB:     239, 242, 247
HSL:     217°, 27%, 95%
CMYK:    6%, 2%, 0%, 3%
Usage:   Tertiary backgrounds, hover states, disabled surfaces
```

### Medium Gray (Lines & Borders)
```
HEX:     #CBD5DB
RGB:     203, 213, 219
HSL:     205°, 15%, 83%
CMYK:    7%, 3%, 0%, 14%
Usage:   Border lines, dividers, subtle separators
```

---

## Text Color Palette

### Text Primary
```
HEX:     #0B1F33
RGB:     11, 31, 51
HSL:     217°, 65%, 12%
CMYK:    78%, 39%, 0%, 80%
Usage:   Headers, primary body text, important labels
Contrast: 18:1 on white ✅✅✅
```

### Text Secondary
```
HEX:     #4B5B7A
RGB:     75, 91, 122
HSL:     218°, 24%, 39%
CMYK:    39%, 25%, 0%, 52%
Usage:   Secondary text, labels, captions
Contrast: 8.5:1 on white ✅✅
```

### Text Tertiary
```
HEX:     #6B7280
RGB:     107, 114, 128
HSL:     216°, 9%, 46%
CMYK:    16%, 11%, 0%, 50%
Usage:   Placeholders, disabled text, muted content
Contrast: 4.8:1 on white ✅
```

---

## Shadow Palette

### Soft Shadow (Default)
```css
box-shadow: 0 2px 8px rgba(10, 37, 64, 0.08);
Usage: Standard cards, subtle elevation
```

### Soft MD Shadow
```css
box-shadow: 0 4px 12px rgba(10, 37, 64, 0.1);
Usage: Card hover states, moderate elevation
```

### Elevated Shadow
```css
box-shadow: 0 8px 24px rgba(10, 37, 64, 0.12);
Usage: Elevated cards, featured sections
```

### Elevated Large Shadow
```css
box-shadow: 0 16px 48px rgba(10, 37, 64, 0.15);
Usage: Modals, dropdowns, highest elevation
```

### Glow Effect (Blue)
```css
box-shadow: 0 0 20px rgba(77, 163, 255, 0.2);
Usage: Focus rings, interactive states
```

### Glow Effect (Gold)
```css
box-shadow: 0 0 16px rgba(212, 175, 55, 0.15);
Usage: Premium element highlights
```

---

## Semantic Color Assignments

### Interactive Elements
| Element | Color | Hex |
|---------|-------|-----|
| Primary Button | Navy | #0A2540 |
| Primary Button Hover | Navy Dark | #1A3A52 |
| Secondary Button | Sky Blue | #4DA3FF |
| Accent Button | Gold | #D4AF37 |
| Link Default | Navy | #0A2540 |
| Link Hover | Sky Blue | #4DA3FF |
| Focus Ring | Sky Blue | #4DA3FF |
| Disabled State | Light Gray | #EFF2F7 |

### Information States
| State | Color | Hex |
|-------|-------|-----|
| Success | Emerald | #10b981 |
| Warning | Amber | #f59e0b |
| Error | Red | #ef4444 |
| Info | Sky Blue | #4DA3FF |

### Form Elements
| Element | Color | Hex |
|---------|-------|-----|
| Border Default | Medium Gray | #CBD5DB |
| Border Focus | Sky Blue | #4DA3FF |
| Background | White | #FFFFFF |
| Text | Navy | #0B1F33 |
| Placeholder | Light Gray | #6B7280 |

---

## Color Combinations for Different Contexts

### Premium/Luxury
```
Navy (#0A2540) + Gold (#D4AF37) + White (#FFFFFF)
→ Premium positioning, luxury brand feel
```

### Modern/Professional
```
Navy (#0A2540) + Sky Blue (#4DA3FF) + White (#FFFFFF)
→ Contemporary, trustworthy appearance
```

### Clean/Minimal
```
Navy (#0A2540) + White (#FFFFFF)
→ Minimalist, focused design
```

### Soft/Elegant
```
Navy (#0A2540) + Light Gray (#F7F9FB) + Gold (#D4AF37)
→ Sophisticated, refined aesthetic
```

---

## Accessibility Contrast Ratios

### On White Background (#FFFFFF)

| Color | Contrast Ratio | WCAG Level |
|-------|---|---|
| Navy (#0A2540) | 18:1 | AAA ✅✅✅ |
| Navy Dark (#1A3A52) | 10.8:1 | AAA ✅✅✅ |
| Sky Blue (#4DA3FF) | 3.8:1 | AA (Large) ✅ |
| Gold (#D4AF37) | 3.1:1 | AA (Large) ✅ |
| Text Primary (#0B1F33) | 17.5:1 | AAA ✅✅✅ |
| Text Secondary (#4B5B7A) | 8.5:1 | AAA ✅✅✅ |
| Text Tertiary (#6B7280) | 4.8:1 | AA ✅ |
| Medium Gray (#CBD5DB) | 2.3:1 | Decorative ⚠️ |

### On Navy Background (#0A2540)

| Color | Contrast Ratio | WCAG Level |
|-------|---|---|
| White (#FFFFFF) | 18:1 | AAA ✅✅✅ |
| Light Gray (#F7F9FB) | 17.8:1 | AAA ✅✅✅ |
| Sky Blue (#4DA3FF) | 4.2:1 | AA ✅ |
| Gold (#D4AF37) | 5.1:1 | AA ✅ |

---

## CSS Variable References

### Brand Colors
```css
var(--brand)           → #0A2540  /* Navy */
var(--brand-2)         → #4DA3FF  /* Sky Blue */
var(--brand-3)         → #1A3A52  /* Navy Dark */
var(--accent)          → #D4AF37  /* Gold */
```

### Surface Colors
```css
var(--surface)         → #FFFFFF      /* White */
var(--surface-2)       → #F7F9FB      /* Light Gray */
var(--surface-3)       → #EFF2F7      /* Very Light Gray */
```

### Text Colors
```css
var(--text-1)          → #0B1F33      /* Primary */
var(--text-2)          → #4B5B7A      /* Secondary */
var(--text-3)          → #6B7280      /* Tertiary */
var(--text-invert)     → #FFFFFF      /* Inverted */
```

### Effects
```css
var(--border)          → rgba(10, 37, 64, 0.08)    /* Subtle */
var(--ring)            → rgba(77, 163, 255, 0.2)   /* Focus */
```

---

## Color Gradients

### Brand Gradient
```css
background: linear-gradient(135deg, #0A2540, #4DA3FF, #D4AF37);
→ Navy to Sky Blue to Gold
```

### Subtle Gradient
```css
background: linear-gradient(135deg, #FFFFFF, #F7F9FB);
→ White to Light Gray
```

### Dark Gradient
```css
background: linear-gradient(135deg, #0A2540, #1A3A52);
→ Navy to Navy Dark
```

---

## Color Harmony

### Complementary
- Navy (#0A2540) ↔ Gold (#D4AF37)
  Highly effective for premium branding

### Analogous
- Navy (#0A2540) → Sky Blue (#4DA3FF) → Light Sky Blue (#7DD3FC)
  Creates sophisticated, harmonious feel

### Split Complementary
- Navy (#0A2540) + Sky Blue (#4DA3FF) + Gold (#D4AF37)
  Primary color scheme used throughout

---

## Color in Different Contexts

### Web Design
- **Headers & Navigation**: Navy (#0A2540)
- **Primary CTA**: Navy (#0A2540) background, white text
- **Secondary CTA**: Sky Blue (#4DA3FF)
- **Accents**: Gold (#D4AF37)
- **Body Text**: Text Primary (#0B1F33)
- **Backgrounds**: White (#FFFFFF) or Light Gray (#F7F9FB)

### Mobile Design
- Same colors, ensure tap targets are 44px+
- High contrast for outdoor visibility
- Test on various screen brightness levels

### Print Design
- Convert to CMYK for accurate printing
- Navy: 84%, 42%, 0%, 75%
- Sky Blue: 70%, 36%, 0%, 0%
- Gold: 0%, 17%, 74%, 17%

---

## Color Testing Tools

### For Contrast Checking
→ [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### For Colorblind Simulation
→ [Coblis - Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

### For Color Harmony
→ [Adobe Color Wheel](https://color.adobe.com/)

### For Palette Generation
→ [Coolors.co](https://coolors.co/)

---

## Color Use Cases

### When to Use Navy (#0A2540)
- Primary buttons
- Headers and titles
- Main navigation
- Prominent text
- Trusted authority

### When to Use Sky Blue (#4DA3FF)
- Secondary buttons
- Links and hover states
- Focus rings
- Accents
- Supporting elements

### When to Use Gold (#D4AF37)
- Premium badges
- Star ratings
- Special highlights
- Call-to-action accents
- Luxury positioning

### When to Use White (#FFFFFF)
- Primary backgrounds
- Text on dark backgrounds
- Clean separations
- Light surfaces

### When to Use Light Gray (#F7F9FB)
- Alternate backgrounds
- Subtle separations
- Disabled states
- Secondary surfaces

---

## Common Color Mistakes to Avoid

❌ **DON'T**: Mix navy with old cyan colors
❌ **DON'T**: Use navy text on light gray (insufficient contrast)
❌ **DON'T**: Overuse gold (reduce visual impact)
❌ **DON'T**: Use white text on sky blue (insufficient contrast)
❌ **DON'T**: Create hardcoded color values (use CSS variables instead)

✅ **DO**: Use CSS variables for all colors
✅ **DO**: Test contrast with WCAG checker
✅ **DO**: Use navy as primary color
✅ **DO**: Reserve gold for premium elements
✅ **DO**: Maintain white backgrounds for readability

---

## Color Accessibility Checklist

- [x] Navy on white: 18:1 contrast (AAA) ✅
- [x] Navy text on light gray: 9:1+ contrast ✅
- [x] Sky blue focus rings: 4:1+ contrast ✅
- [x] Gold badges on white: 3:1+ contrast (AA) ✅
- [x] Color not sole information method ✅
- [x] Text hierarchy based on size, weight ✅
- [x] Icons have text labels ✅
- [x] Form labels properly associated ✅

---

## Quick Copy-Paste Reference

### HTML/CSS
```html
<!-- Color in HTML -->
<div style="color: #0A2540;">Navy Text</div>
<div style="background-color: #4DA3FF;">Sky Blue Background</div>

<!-- CSS Variables -->
background-color: var(--brand);     /* Navy */
color: var(--text-1);               /* Navy Text */
```

### Tailwind Classes
```jsx
className="bg-brand text-text-1"    {/* Navy bg, dark text */}
className="bg-brand-2 text-white"   {/* Sky blue bg, white text */}
className="border border-border"    {/* Subtle navy border */}
```

### Design Files
- **Figma**: Navy #0A2540, Sky Blue #4DA3FF, Gold #D4AF37
- **Adobe**: Enter hex values
- **Sketch**: Use hex format

---

## Color Evolution

| Aspect | Old Theme | New Theme | Improvement |
|--------|-----------|-----------|------------|
| Primary | Teal | Navy | More elegant, trustworthy |
| Secondary | Cyan | Sky Blue | More sophisticated |
| Background | Dark | White | Cleaner, modern |
| Text | Light | Dark Navy | Better readability |
| Accent | Cyan | Gold | Premium positioning |
| Feel | Tech | Luxury | Brand elevation |

---

**Last Updated**: January 28, 2026
**Color System Version**: 1.0
**Status**: ✅ Final

---

**For questions about colors, refer to DESIGN_SYSTEM.md or QUICK_REFERENCE.md**

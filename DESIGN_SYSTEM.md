# Luxury Marble Brand - Design System

## Overview

A premium, elegant design system for a luxury marble e-commerce platform. The design emphasizes minimalism, premium aesthetics, and modern sophistication with a focus on high-end brand positioning.

---

## Color Palette

### Primary Colors

| Name | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Navy** | ![#0A2540](https://via.placeholder.com/50x30/0A2540/0A2540) | `#0A2540` | Primary CTA, Headers, Navigation, Key elements |
| **Primary Navy Dark** | ![#1A3A52](https://via.placeholder.com/50x30/1A3A52/1A3A52) | `#1A3A52` | Hover states, Secondary actions |
| **Primary Navy Very Dark** | ![#082040](https://via.placeholder.com/50x30/082040/082040) | `#082040` | Active states, Deep shadows |

### Secondary Colors

| Name | Color | Hex | Usage |
|------|-------|-----|-------|
| **Sky Blue** | ![#4DA3FF](https://via.placeholder.com/50x30/4DA3FF/4DA3FF) | `#4DA3FF` | Accents, Links, Secondary buttons |
| **Sky Blue Light** | ![#7DD3FC](https://via.placeholder.com/50x30/7DD3FC/7DD3FC) | `#7DD3FC` | Hover states, Hover effects |

### Accent Colors

| Name | Color | Hex | Usage |
|------|-------|-----|-------|
| **Gold** | ![#D4AF37](https://via.placeholder.com/50x30/D4AF37/D4AF37) | `#D4AF37` | Premium accents, Stars, Special elements |

### Background & Surface Colors

| Name | Color | Hex | Usage |
|------|-------|-----|-------|
| **White** | ![#FFFFFF](https://via.placeholder.com/50x30/FFFFFF/FFFFFF) | `#FFFFFF` | Primary background |
| **Light Gray** | ![#F7F9FB](https://via.placeholder.com/50x30/F7F9FB/F7F9FB) | `#F7F9FB` | Secondary background, Cards |
| **Very Light Gray** | ![#EFF2F7](https://via.placeholder.com/50x30/EFF2F7/EFF2F7) | `#EFF2F7` | Tertiary background |

### Text Colors

| Name | Color | Hex | Usage |
|------|-------|-----|-------|
| **Text Primary** | ![#0B1F33](https://via.placeholder.com/50x30/0B1F33/0B1F33) | `#0B1F33` | Body text, Headlines |
| **Text Secondary** | ![#4B5B7A](https://via.placeholder.com/50x30/4B5B7A/4B5B7A) | `#4B5B7A` | Secondary text, Labels |
| **Text Tertiary** | ![#6B7280](https://via.placeholder.com/50x30/6B7280/6B7280) | `#6B7280` | Placeholders, Captions |

---

## Typography

### Font Family
- **Primary**: Beiruti (RTL/LTR support)
- **Fallback**: Cairo, System UI

### Type Scale

| Type | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display 1** | 3.5rem | 700 | 1.1 | Main page headers |
| **Display 2** | 3rem | 700 | 1.15 | Section headers |
| **Headline** | 2.25rem | 600 | 1.2 | Major headings |
| **Title** | 1.5rem | 600 | 1.4 | Subsection titles |
| **Body** | 1rem | 400 | 1.8 | Main body text |
| **Caption** | 0.875rem | 400 | 1.6 | Small text, captions |

---

## Spacing System

Standard spacing scale (4px base):

```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 2.5rem (40px)
3xl: 3rem (48px)
```

### Section Spacing
- **Standard Section**: `4rem` (64px)
- **Large Section**: `6rem` (96px)
- **Gutter**: `1.25rem` (20px)

---

## Shadows

Premium, subtle shadows for depth without visual weight:

| Name | CSS | Usage |
|------|-----|-------|
| **Soft** | `0 2px 8px rgba(10, 37, 64, 0.08)` | Default card shadow |
| **Soft MD** | `0 4px 12px rgba(10, 37, 64, 0.1)` | Hover card shadow |
| **Elevated** | `0 8px 24px rgba(10, 37, 64, 0.12)` | Elevated components |
| **Elevated LG** | `0 16px 48px rgba(10, 37, 64, 0.15)` | Modals, Dropdowns |
| **Glow** | `0 0 20px rgba(77, 163, 255, 0.2)` | Interactive focus |
| **Glow Accent** | `0 0 16px rgba(212, 175, 55, 0.15)` | Gold accent glow |

---

## Border Radius

| Name | Size | Usage |
|------|------|-------|
| **sm-card** | 12px | Small cards, buttons |
| **card** | 16px | Standard cards, components |
| **panel** | 20px | Large panels, containers |
| **pill** | 999px | Pill buttons, badges |

---

## Components

### Buttons

#### Primary Button
- **Background**: `#0A2540` (Primary Navy)
- **Text**: White
- **Hover**: `#1A3A52`
- **Shadow**: Soft with hover lift effect
- **Padding**: `1.5rem 1.5rem` (24px horizontal, 12px vertical)
- **Border Radius**: 12px
- **Font Weight**: 600

```css
.btn-primary {
  @apply bg-brand hover:bg-primary-700 text-white shadow-soft hover:shadow-soft-md;
}
```

#### Secondary Button
- **Background**: `#4DA3FF` (Sky Blue)
- **Text**: White
- **Hover**: Lighter shade
- **Same shadow treatment as primary**

#### Outline Button
- **Border**: 2px `#0A2540`
- **Text**: `#0A2540`
- **Hover**: Soft background fill
- **No shadow**

#### Ghost Button
- **Background**: Transparent
- **Text**: `#0A2540`
- **Hover**: `rgba(10, 37, 64, 0.05)` background
- **No shadow**

### Cards

#### Standard Card
```css
.card {
  @apply bg-white rounded-panel shadow-soft border border-surface-2;
}
```

- **Background**: White
- **Border**: 1px solid `#EFF2F7`
- **Shadow**: Soft shadow
- **Hover**: Elevates to `shadow-soft-md`
- **Border Radius**: 20px
- **Transition**: All properties with 300ms ease-out

#### Elevated Card
- **Shadow**: `shadow-elevated` (stronger shadow)
- **Border**: Same as standard
- **Useful for**: Featured items, hero sections

### Input Fields

```css
.input-field {
  @apply w-full px-4 py-3 border border-surface-2 rounded-lg bg-white text-text-1 focus:outline-none focus:ring-2 focus:ring-brand-2 focus:border-transparent;
}
```

- **Background**: White
- **Border**: 1px solid `#EFF2F7`
- **Text**: `#0B1F33`
- **Placeholder**: `#6B7280`
- **Focus Ring**: 2px `#4DA3FF`
- **Padding**: `0.75rem 1rem`
- **Border Radius**: 12px
- **Hover**: Border becomes `#E0E7F1`

### Badges

#### Primary Badge
```css
.badge {
  @apply inline-flex items-center px-3 py-1 rounded-pill bg-primary-100 text-brand text-sm font-medium;
}
```

#### Secondary Badge
- **Background**: Light blue `rgba(77, 163, 255, 0.1)`
- **Text**: `#4DA3FF`

#### Accent Badge
- **Background**: Light gold `rgba(212, 175, 55, 0.1)`
- **Text**: `#D4AF37`

---

## Effects & Animations

### Transitions
- **Standard**: `transition-all duration-300 ease-out`
- **Fast**: `transition-all duration-200 ease-out`
- **Slow**: `transition-all duration-500 ease-out`

### Hover Effects

#### Hover Lift
```css
.hover-lift {
  @apply hover:shadow-soft-md hover:-translate-y-1 smooth;
}
```
Elevates element on hover with shadow enhancement.

#### Hover Glow
```css
.hover-glow {
  @apply hover:shadow-glow smooth;
}
```
Adds blue glow effect on hover.

### Glass Morphism

#### Standard Glass
```css
.glass {
  @apply bg-white/80 backdrop-blur-glass border border-white/20 rounded-panel;
}
```

#### Dark Glass
```css
.glass-dark {
  @apply bg-brand/5 backdrop-blur-glass border border-brand/10 rounded-panel;
}
```

---

## Responsive Design

### Breakpoints
- **xs**: 475px
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile First Approach
Build for mobile first, then enhance for larger screens using Tailwind breakpoints:

```jsx
// Good
<div className="px-4 md:px-6 lg:px-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Responsive Heading
  </h1>
</div>
```

---

## Design Principles

### 1. **Minimalism**
- Clean, uncluttered layouts
- Ample whitespace
- Only essential elements visible
- Reduce visual noise

### 2. **Premium Aesthetic**
- Subtle animations and transitions
- High-quality imagery with marble textures
- Sophisticated color combinations
- Elegant typography

### 3. **Modern & Clean**
- Contemporary design patterns
- Clear visual hierarchy
- Smooth, fluid interactions
- Professional appearance

### 4. **High Readability**
- Sufficient contrast ratios
- Generous line-height (1.6-1.8)
- Clear text hierarchy
- Proper font sizing

### 5. **Soft Shadows**
- Use subtle shadows for depth
- Avoid harsh, dark shadows
- Layer shadows for complexity
- Enhance on interactive elements

### 6. **Smooth Animations**
- Use ease-out timing for natural motion
- Keep animations under 400ms for snappy feel
- Avoid jank - use CSS transforms
- Reduce motion for accessibility

### 7. **Luxury Brand Feeling**
- Gold accents for premium elements
- Navy blue for trust and elegance
- White/light backgrounds for cleanliness
- Marble textures as subtle patterns

---

## Usage Examples

### Hero Section
```jsx
<div className="bg-gradient-subtle py-section lg:py-section-lg">
  <div className="container">
    <h1 className="text-display-2 text-text-1 mb-4">
      Premium Marble Collection
    </h1>
    <p className="text-title text-text-2 mb-8 max-w-2xl">
      Discover timeless elegance in every marble piece.
    </p>
    <button className="btn btn-primary">Explore Now</button>
  </div>
</div>
```

### Product Card
```jsx
<div className="card p-6 hover-lift">
  <img src="marble.jpg" className="w-full rounded-card mb-4" />
  <h3 className="text-title text-text-1 mb-2">Marble Name</h3>
  <p className="text-body text-text-2 mb-4">Description</p>
  <div className="flex justify-between items-center">
    <span className="text-title font-bold text-brand">$999</span>
    <button className="btn btn-secondary btn-sm">Add to Cart</button>
  </div>
</div>
```

### Input Form
```jsx
<form className="space-y-6">
  <div className="inputGroup">
    <input 
      type="text" 
      className="input-field" 
      placeholder="Full Name"
    />
  </div>
  <button type="submit" className="btn btn-primary w-full">
    Submit
  </button>
</form>
```

---

## CSS Variables

All colors and styles are defined as CSS variables in `:root`:

```css
:root {
  --brand: #0A2540;
  --brand-2: #4DA3FF;
  --brand-3: #1A3A52;
  --accent: #D4AF37;
  
  --surface: #FFFFFF;
  --surface-2: #F7F9FB;
  --surface-3: #EFF2F7;
  
  --text-1: #0B1F33;
  --text-2: #4B5B7A;
  --text-3: #6B7280;
  
  /* ... and more */
}
```

Update colors globally by changing CSS variables instead of searching and replacing hex codes.

---

## Accessibility

### Color Contrast
- Text on background: WCAG AA compliant (4.5:1 minimum)
- All interactive elements have adequate contrast
- Avoid relying on color alone for information

### Focus States
- All interactive elements have visible focus indicators
- Focus ring: 2px solid with sufficient contrast
- Focus visible states maintained throughout

### Motion
- Respect `prefers-reduced-motion` setting
- Animations are optional enhancements
- Critical interactions don't require animation

### Typography
- Heading hierarchy maintained (H1 → H6)
- Sufficient line-height for readability
- Proper font sizing for text content

---

## File Structure

```
app/
├── globals.css          # Global styles, CSS variables, base layers
├── page.module.css      # Page-specific styles
└── (auth)/
    └── auth.module.css  # Auth component styles

components/
├── UI/
│   ├── Buttons/         # Button components
│   ├── Card/            # Card components
│   ├── Inputs/          # Input field components
│   └── ...
└── ...

tailwind.config.ts       # Tailwind configuration with extended theme
```

---

## Migration Notes

### Old Color System → New Luxury System

| Old | New | Hex |
|-----|-----|-----|
| Teal | Navy | #0A2540 |
| Cyan | Sky Blue | #4DA3FF |
| Dark Slate | White | #FFFFFF |
| Light Gray | Light Blue-Gray | #F7F9FB |
| Cyan Accent | Gold | #D4AF37 |

All Tailwind classes now reference CSS variables, allowing for consistent theming across the entire application.

---

## Best Practices

1. **Use CSS Variables**: Always prefer CSS variable references (`var(--brand)`) over hardcoded hex values
2. **Follow Tailwind First**: Use Tailwind utility classes before custom CSS
3. **Maintain Consistency**: Stick to the defined color palette and typography
4. **Test Accessibility**: Ensure sufficient contrast and keyboard navigation
5. **Mobile First**: Design for mobile, enhance for larger screens
6. **Performance**: Minimize custom CSS, leverage Tailwind's optimizations
7. **Documentation**: Update this guide when design patterns change

---

## Support & Questions

For design system questions or updates, refer to this documentation or contact the design team.

Last Updated: January 28, 2026

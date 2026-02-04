# Luxury Marble Brand - Quick Reference Guide

## 🎨 Color Palette Quick Access

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Navy | `#0A2540` | Headers, primary buttons, text |
| Navy Dark | `#1A3A52` | Hover states |
| Navy Very Dark | `#082040` | Deep accents |

### Secondary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Sky Blue | `#4DA3FF` | Secondary buttons, links |
| Sky Blue Light | `#7DD3FC` | Hover states |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| Gold | `#D4AF37` | Premium accents |

### Backgrounds
| Name | Hex | Usage |
|------|-----|-------|
| White | `#FFFFFF` | Primary background |
| Light Gray | `#F7F9FB` | Secondary surfaces |
| Very Light Gray | `#EFF2F7` | Tertiary surfaces |

### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#0B1F33` | Headers, body text |
| Text Secondary | `#4B5B7A` | Labels, secondary text |
| Text Tertiary | `#6B7280` | Captions, placeholders |

---

## 🧩 Component Usage

### Buttons

```jsx
// Primary Button (Navy)
<button className="btn btn-primary">Submit</button>

// Secondary Button (Sky Blue)
<button className="btn btn-secondary">Secondary</button>

// Accent Button (Gold)
<button className="btn btn-accent">Special</button>

// Outline Button (Navy Border)
<button className="btn btn-outline">Outline</button>

// Ghost Button (Transparent)
<button className="btn btn-ghost">Ghost</button>
```

### Cards

```jsx
// Standard Card
<div className="card p-6">
  <h3 className="text-title text-text-1 mb-4">Card Title</h3>
  <p className="text-body text-text-2">Card content here</p>
</div>

// Elevated Card
<div className="card-elevated p-6">
  Featured content
</div>
```

### Input Fields

```jsx
<input 
  type="text" 
  className="input-field"
  placeholder="Enter text..."
/>
```

### Badges

```jsx
// Primary Badge
<span className="badge">Primary</span>

// Secondary Badge
<span className="badge-secondary">Secondary</span>

// Accent Badge
<span className="badge-accent">Accent</span>
```

---

## 📐 Shadows

```css
/* Soft Shadow (Default) */
box-shadow: 0 2px 8px rgba(10, 37, 64, 0.08);

/* Soft MD Shadow (Hover) */
box-shadow: 0 4px 12px rgba(10, 37, 64, 0.1);

/* Elevated Shadow */
box-shadow: 0 8px 24px rgba(10, 37, 64, 0.12);

/* Elevated Large Shadow */
box-shadow: 0 16px 48px rgba(10, 37, 64, 0.15);

/* Glow Effect */
box-shadow: 0 0 20px rgba(77, 163, 255, 0.2);

/* Gold Glow */
box-shadow: 0 0 16px rgba(212, 175, 55, 0.15);
```

---

## ⚡ Utility Classes

### Spacing
```jsx
<div className="gap-luxury">          {/* gap-6 md:gap-8 */}
<div className="p-luxury">            {/* p-6 md:p-8 lg:p-10 */}
```

### Transitions
```jsx
<div className="smooth">              {/* 300ms ease-out */}
<div className="smooth-fast">         {/* 200ms ease-out */}
<div className="smooth-slow">         {/* 500ms ease-out */}
```

### Hover Effects
```jsx
<div className="hover-lift">          {/* Elevation + transform */}
<div className="hover-glow">          {/* Glow effect */}
```

### Glass Effects
```jsx
<div className="glass">               {/* White glass */}
<div className="glass-dark">          {/* Navy glass */}
```

### Gradients
```jsx
<h1 className="text-gradient">       {/* Navy → Sky Blue → Gold */}
<div className="bg-gradient-brand">  {/* Brand gradient */}
<div className="bg-gradient-subtle"> {/* Subtle light gradient */}
```

---

## 🎯 Typography

### Heading Styles
```jsx
<h1 className="text-display-1 text-text-1">Main Header</h1>
<h2 className="text-display-2 text-text-1">Section Header</h2>
<h3 className="text-headline text-text-1">Subsection</h3>
<h4 className="text-title text-text-1">Title</h4>
<p className="text-body text-text-2">Body text</p>
<p className="text-caption text-text-3">Caption</p>
```

---

## 🔧 CSS Variables

Access colors with CSS variables:

```css
background-color: var(--brand);      /* Navy */
background-color: var(--brand-2);    /* Sky Blue */
background-color: var(--accent);     /* Gold */
background-color: var(--surface);    /* White */
background-color: var(--surface-2);  /* Light Gray */
color: var(--text-1);                /* Primary Text */
color: var(--text-2);                /* Secondary Text */
color: var(--text-3);                /* Tertiary Text */
border: 1px solid var(--border);     /* Subtle Border */
box-shadow: 0 0 20px var(--ring);    /* Focus Ring */
```

---

## 📱 Responsive Design

### Breakpoints
```jsx
// Mobile First (default)
<div className="px-4 md:px-6 lg:px-8">
  Content
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  Items
</div>
```

---

## ✅ Best Practices

### ✅ DO:
```jsx
// ✅ Use CSS variables
<div style={{backgroundColor: 'var(--brand)'}}>
// OR use Tailwind classes
<div className="bg-brand">

// ✅ Use Tailwind utilities
<button className="btn btn-primary">

// ✅ Use semantic colors
<p className="text-text-1">Primary text</p>

// ✅ Responsive classes
<div className="px-4 md:px-6 lg:px-8">
```

### ❌ DON'T:
```jsx
// ❌ Hardcoded colors
<div style={{backgroundColor: '#0A2540'}}>

// ❌ Inconsistent shadows
<div style={{boxShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>

// ❌ Inconsistent spacing
<div style={{padding: '10px 15px'}}>

// ❌ Missing responsive design
<h1 className="text-4xl">Non-responsive</h1>
```

---

## 🎨 Color Combinations

### Recommended Combinations
```
Navy + Gold        → Premium accent
Navy + White       → Clean, minimal
Navy + Sky Blue    → Modern, professional
Gold + White       → Luxury positioning
Navy + Light Gray  → Soft, elegant
```

### Text on Background
```
Navy text on white           → Excellent contrast ✅
Navy text on light gray      → Excellent contrast ✅
White text on navy           → Excellent contrast ✅
Gold text on white           → Good contrast (AA) ✅
Gold on light gray           → Good contrast (AA) ✅
```

---

## 🚀 Common Patterns

### Hero Section
```jsx
<section className="bg-gradient-subtle py-section">
  <div className="container">
    <h1 className="text-display-2 text-text-1 mb-4">
      Premium Heading
    </h1>
    <p className="text-title text-text-2 mb-8 max-w-2xl">
      Elegant description
    </p>
    <button className="btn btn-primary">Call to Action</button>
  </div>
</section>
```

### Product Card
```jsx
<div className="card p-6 hover-lift">
  <img src="product.jpg" className="w-full rounded-card mb-4" />
  <h3 className="text-title text-text-1 mb-2">Product Name</h3>
  <p className="text-body text-text-2 mb-4">Description</p>
  <div className="flex justify-between items-center">
    <span className="text-title font-bold text-brand">$999</span>
    <button className="btn btn-secondary btn-sm">Add to Cart</button>
  </div>
</div>
```

### Form Section
```jsx
<form className="space-y-6 max-w-md">
  <div className="inputGroup">
    <label className="block text-body text-text-1 mb-2">
      Full Name
    </label>
    <input 
      type="text" 
      className="input-field"
      placeholder="Your name"
    />
  </div>
  
  <button type="submit" className="btn btn-primary w-full">
    Submit
  </button>
</form>
```

### Feature Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {features.map((feature) => (
    <div key={feature.id} className="card p-6 hover-lift">
      <h3 className="text-title text-text-1 mb-2">{feature.title}</h3>
      <p className="text-body text-text-2">{feature.description}</p>
    </div>
  ))}
</div>
```

---

## 🔍 Debugging Tips

### Check Colors
```jsx
// Inspect CSS variables
getComputedStyle(document.documentElement)
  .getPropertyValue('--brand')  // Returns: " #0A2540"
```

### Check Shadows
```css
/* All shadows should be soft and use navy rgba */
box-shadow: 0 2px 8px rgba(10, 37, 64, 0.08);
```

### Check Contrast
Use tools like:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- DevTools Accessibility Inspector
- Lighthouse Accessibility Audit

---

## 📚 Related Documentation

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Complete design system
- [REDESIGN_IMPLEMENTATION_SUMMARY.md](./REDESIGN_IMPLEMENTATION_SUMMARY.md) - Implementation details

---

## 🤝 Questions?

Refer to the complete design system documentation or the implementation summary for detailed information.

---

**Last Updated**: January 28, 2026
**Version**: 1.0

# 🎨 TAILWIND CSS RESPONSIVE REFERENCE

Complete guide to the Tailwind classes used in refactored components.

---

## 📱 BREAKPOINT SYSTEM

```
Mobile First Approach
├── Default  (320px+)   - Mobile styles (always apply)
├── sm       (640px+)   - Small devices, larger phones
├── md       (768px+)   - Tablets
├── lg       (1024px+)  - Desktops
└── xl       (1280px+)  - Large desktops

Example: md:grid-cols-3
  → Default: Don't apply
  → < 768px: Don't apply  
  → ≥ 768px: APPLY grid-cols-3
```

---

## 🧭 NAVBAR RESPONSIVE CLASSES

### Header Container
```jsx
// Base: sticky white header with 64px height
// Scrolled: reduced height + stronger shadow
.header
  position-sticky top-0 z-100 w-full
  h-64px bg-white/95 backdrop-blur-2xl
  
// Scrolled effect
.headerScrolled
  h-60px shadow-lg
```

### Logo Section
```jsx
<div className="flex items-center">
  {/* Logo stays visible on ALL screen sizes */}
  {/* sm+ : gap increases */}
</div>
```

### Desktop Navigation (Center)
```jsx
<nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
  {/* HIDDEN: on mobile, sm
      VISIBLE: md (768px+)
      Flex center with auto width (flex-1) */}
  
  {/* Each link: 12px padding both sides */}
  <Link className="px-3 py-2 rounded-lg text-sm font-medium">
</nav>
```

### Action Icons (Search, Heart, Cart, Bell)
```jsx
<div className="hidden sm:flex items-center gap-1">
  {/* HIDDEN: mobile
      VISIBLE: sm (640px+)
      
      Icon padding: 8px (p-2)
      Gap between icons: 4px (gap-1)
  */}
</div>
```

### Auth Button
```jsx
{/* Desktop version: sm:flex (hidden on mobile) */}
<Button className="hidden sm:inline-flex">
  {/* Shows on sm+ devices */}
</Button>

{/* Mobile version: always visible */}
<button className="sm:hidden p-2">
  {/* Menu button: only visible < 640px */}
</button>
```

### Mobile Menu Drawer
```jsx
<div className="sm:hidden">
  {/* Only render on mobile: hidden sm+ */}
  
  {/* Overlay backdrop */}
  <div className="fixed inset-0 top-16 z-40 bg-black/40 sm:hidden" />
  
  {/* Menu panel */}
  <div className="fixed top-16 right-0 bottom-0 w-4/5 max-w-xs sm:hidden
                  translate-x-0 sm:translate-x-full">
    {/* w-4/5: 80% width
        sm:hidden: disappear on tablet+
        translate-x-0: visible when open
        sm:translate-x-full: off-screen on tablet+ */}
  </div>
</div>
```

---

## 🦸 HERO SECTION RESPONSIVE

### Container
```jsx
<section className="relative w-full mb-12 sm:mb-16 md:mb-20">
  {/* mb-12: 48px margin mobile
      sm:mb-16: 64px margin on sm+
      md:mb-20: 80px margin on md+ */}
</section>
```

### Image Container Heights
```jsx
<div className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px]">
  {/* Mobile: 280px (slim)
      sm (640px+): 360px
      md (768px+): 420px
      lg (1024px+): 480px
      
      CSS arbitrary: [280px] syntax */}
</div>
```

### Content Card Spacing
```jsx
<div className="space-y-4 sm:space-y-6">
  {/* gap between elements:
      Mobile: 16px (space-y-4)
      sm+: 24px (space-y-6)
  */}
</div>
```

### Heading Responsive Text
```jsx
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold">
  {/* Mobile: 30px (text-3xl)
      sm: 36px (text-4xl)
      md: 48px (text-5xl)
      lg: 60px (text-6xl)
  */}
</h1>
```

### Button Layout
```jsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  {/* Mobile: Vertical stack (flex-col)
      sm+: Horizontal row (sm:flex-row)
      Mobile gap: 12px (gap-3)
      sm+ gap: 16px (sm:gap-4) */}

  <link className="w-full sm:w-auto">
    {/* Mobile: Full width (w-full)
        sm+: Auto width (sm:w-auto) */}
  </link>
</div>
```

### Min Height for Touch
```jsx
<link className="min-h-[44px]">
  {/* Minimum 44px height for touch accessibility */}
</link>
```

---

## 🧱 CATEGORIES GRID RESPONSIVE

### Grid System (MOST IMPORTANT)
```jsx
<div className="grid gap-3 sm:gap-4 md:gap-5 
                grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  
  {/* COLUMNS: Mobile (2) → Tablet (3) → Desktop (4)
      grid-cols-2:      Default 2 columns
      md:grid-cols-3:   At 768px, switch to 3
      lg:grid-cols-4:   At 1024px, switch to 4
      
      GAPS: Systematic increase
      gap-3:  Mobile 12px
      sm:gap-4: Prepare for tablet (16px)
      md:gap-5: Tablet+ 20px
  */}
  
  {/* Each card: aspect-square for equal heights */}
  <div className="aspect-square rounded-2xl">
</div>
```

### Skeleton Loading
```jsx
<div className="aspect-square rounded-2xl bg-gradient-to-br
                from-slate-200 to-slate-100 animate-pulse">
  {/* aspect-square: Square cards
      gradient + pulse: Loading state */}
</div>
```

---

## 📢 CTA SECTION RESPONSIVE

### Two-Column Desktop, One Column Mobile
```jsx
<div className="grid gap-8 md:grid-cols-2 items-center">
  {/* Mobile: 1 column (stacked)
      md+: 2 columns
      Vertical gap: 32px (gap-8)
      Vertical alignment: center (items-center) */}

  <div>
    {/* Left: Content */}
  </div>
  
  <div>
    {/* Right: CTA Button */}
  </div>
</div>
```

### Responsive Button
```jsx
<link className="px-8 py-4 rounded-xl w-full 
                 sm:w-auto min-h-[52px] text-lg">
  {/* Mobile: w-full | padding: 32px-32px × 16px
      sm+: w-auto (shrink to content)
      min height: 52px (larger touch area)
      text-lg: Bigger font on button */}
</link>
```

### Trust Indicators Grid
```jsx
<div className="grid grid-cols-2 gap-4 md:gap-6">
  {/* Mobile: 2 columns, 16px gap
      md+: 2 columns, 24px gap
      (columns stay same, gap increases) */}
</div>
```

---

## 🤝 PARTNERS SECTION RESPONSIVE

### Desktop: Regular Grid
```jsx
<div className="hidden md:grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* HIDDEN: < 768px (show scroll instead)
      VISIBLE: md+ (show grid)
      
      grid-cols-2: 768-1024px range
      lg:grid-cols-3: 1024-1280px range
      xl:grid-cols-4: 1280px+ range */}
</div>
```

### Mobile: Horizontal Scroll
```jsx
<div className="md:hidden space-y-4">
  {/* md:hidden: Only on mobile
      space-y-4: Vertical gap of 16px */}
  
  {/* Scroll container */}
  <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory
                   flex gap-4 px-12 py-2">
    {/* overflow-x-auto: Enable horizontal scroll
        scroll-smooth: Smooth scroll behavior
        snap-x: Snap to items horizontally
        flex: Horizontal layout
        gap-4: 16px between cards
        px-12: Left/right padding for buttons */}
    
    {/* Individual cards */}
    <div className="flex-shrink-0 w-64 snap-center">
      {/* flex-shrink-0: Don't shrink
          w-64: Fixed 256px width
          snap-center: Snap to center */}
    </div>
  </div>

  {/* Scroll buttons */}
  <button className="absolute right-0 p-2 sm:hidden">
    {/* sm:hidden: Only visible on mobile */}
  </button>
</div>
```

---

## 🧾 FOOTER RESPONSIVE

### Desktop: 4-Column Grid
```jsx
<div className="hidden sm:grid gap-10 md:grid-cols-2 lg:grid-cols-4">
  {/* sm:hidden: Mobile hides grid
      hidden: But keep structure
      
      md:grid-cols-2: At 768px, 2 columns
      lg:grid-cols-4: At 1024px, 4 columns */}
</div>
```

### Mobile: Accordion (Drawer Style)
```jsx
<div className="sm:hidden space-y-3">
  {/* sm:hidden: Only visible mobile
      space-y-3: 12px gap between sections */}
  
  <AccordionSection>
    {/* Border and flex for toggle interaction */}
    <button className="w-full flex items-center justify-between
                       px-4 py-4 sm:py-3">
      {/* py-4: Mobile larger click area
          sm:py-3: Tablet reduces padding
          w-full: Full width clickable
          flex: Space-between for title + chevron */}
    </button>
  </AccordionSection>
</div>
```

### Footer Bottom
```jsx
<div className="border-t border-slate-800 pt-6 sm:pt-8 
                text-center text-xs sm:text-sm text-slate-400
                space-y-2">
  {/* pt-6: 24px padding top
      sm:pt-8: 32px on sm+
      text-xs: 12px mobile
      sm:text-sm: 14px on sm+
      space-y-2: 8px gap between text items */}
</div>
```

---

## 🎯 SPACING SCALE REFERENCE

```
Gap/Padding Utilities Used:

gap-1  = 4px (0.25rem)
gap-2  = 8px (0.5rem)
gap-3  = 12px (0.75rem)
gap-4  = 16px (1rem)
gap-5  = 20px (1.25rem)
gap-6  = 24px (1.5rem)
gap-8  = 32px (2rem)
gap-10 = 40px (2.5rem)
gap-12 = 48px (3rem)

px-3 = 12px horizontal padding
px-4 = 16px horizontal padding
px-6 = 24px horizontal padding
px-8 = 32px horizontal padding

py-2 = 8px vertical padding
py-3 = 12px vertical padding
py-4 = 16px vertical padding

Margin Bottom (mb):
mb-12, sm:mb-16, md:mb-20 = 48px → 64px → 80px
```

---

## 🎨 COLOR UTILITIES

```
Blue Palette (Primary)
bg-blue-50   = Very light blue background
bg-blue-600  = Main CTA blue
hover:bg-blue-700 = Slightly darker on hover
text-blue-600 = Blue text

Slate Palette (Neutral/Secondary)
bg-slate-50  = Light section background
bg-slate-900 = Dark footer
text-slate-600 = Medium gray text
text-slate-300 = Light gray text
border-slate-200 = Light border

Opacity
bg-white/95  = 95% opaque white
bg-black/40  = 40% opaque black
```

---

## ⚡ RESPONSIVE PATTERNS CHEATSHEET

### Hidden on Mobile, Visible on Desktop
```jsx
<div className="hidden md:flex">
  {/* Mobile (< 768px): HIDDEN
      Desktop (≥ 768px): Visible with flex */}
</div>
```

### Full Width on Mobile, Auto on Desktop
```jsx
<button className="w-full sm:w-auto">
  {/* Mobile: Stretches full width
      sm+: Shrinks to content */}
</button>
```

### Stacked Mobile, Row Mobile+
```jsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  {/* Default (mobile): flex-col (vertical)
      sm+: sm:flex-row (horizontal)
      Gaps scale too */}
</div>
```

### 2-Col Mobile, 3-Col Tablet, 4-Col Desktop
```jsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {/* Progressive column increase */}
</div>
```

### Responsive Text Size
```jsx
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
  {/* 30px → 36px → 48px → 60px */}
</h1>
```

---

## 🔍 DEBUGGING RESPONSIVE ISSUES

### Chrome DevTools
1. Open DevTools (F12)
2. Device Toolbar (Ctrl+Shift+M)
3. Test at: 375px, 768px, 1024px, 1280px
4. Check computed styles for each breakpoint

### Common Issues & Fixes

**Issue**: Content overflows on mobile
```jsx
// ❌ Wrong: Hardcoded width
<div className="w-520px">

// ✅ Right: Responsive with padding
<div className="w-full px-4 md:max-w-2xl mx-auto">
```

**Issue**: Buttons too small on mobile
```jsx
// ❌ Wrong: Single size
<button className="p-2">Small</button>

// ✅ Right: Responsive padding + min-height
<button className="p-2 sm:p-3 min-h-[44px]">
```

**Issue**: Grid doesn't stack properly
```jsx
// ❌ Wrong: Fixed columns
<div className="grid grid-cols-3">

// ✅ Right: Starts with 1-2 cols
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

---

## 📊 TAILWIND CONFIG REFERENCE

Current config uses:
- **Spacing scale**: 0-96 (0, 4px, 8px, ... 384px)
- **Breakpoints**: 640px, 768px, 1024px, 1280px, 1536px
- **Colors**: Full palette with shades 50-950
- **Max-width**: 1280px (xl container max)

---

## ✅ BEST PRACTICES USED

1. ✓ **Mobile-First**: Default styles, add sm:/md:/lg: overrides
2. ✓ **Consistent Spacing**: Gap scales proportionally
3. ✓ **Touch Friendly**: Min 44px targets
4. ✓ **No Overflow**: Padding + max-width constraints
5. ✓ **Semantic Layout**: flex/grid with clear intent
6. ✓ **Performance**: Utility-first (no extra CSS)
7. ✓ **Readability**: Class names read like readable sentences

---

Generated for Shakeltaban Platform | Feb 2026

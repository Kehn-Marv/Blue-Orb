# Blue Orb Design System

## 🎨 Visual Identity

### Brand Colors

#### Primary Palette
- **Blue Primary**: `#3B82F6` - Main brand color, trust and education
- **Blue Hover**: `#2563EB` - Interactive states
- **Blue Light**: `#DBEAFE` - Background accents

#### Secondary Palette  
- **Purple**: `#8B5CF6` - Innovation and creativity
- **Purple Hover**: `#7C3AED` - Interactive states
- **Purple Light**: `#EDE9FE` - Background accents

#### Accent Colors
- **Cyan**: `#06B6D4` - Technology and progress
- **Cyan Hover**: `#0891B2` - Interactive states
- **Cyan Light**: `#CFFAFE` - Background accents

#### Status Colors
- **Success**: `#10B981` - Positive actions and confirmations
- **Success Light**: `#D1FAE5` - Success backgrounds
- **Warning**: `#F59E0B` - Attention and caution
- **Warning Light**: `#FEF3C7` - Warning backgrounds
- **Error**: `#EF4444` - Errors and destructive actions
- **Error Light**: `#FEE2E2` - Error backgrounds

#### Neutral Palette
- **Gray 900**: `#111827` - Primary text
- **Gray 700**: `#374151` - Secondary text
- **Gray 500**: `#6B7280` - Tertiary text
- **Gray 300**: `#D1D5DB` - Borders and dividers
- **Gray 100**: `#F3F4F6` - Background surfaces
- **Gray 50**: `#F9FAFB` - Light backgrounds
- **White**: `#FFFFFF` - Primary background

### Typography

#### Font Families
- **Primary**: Inter, system-ui, -apple-system, sans-serif
- **Monospace**: JetBrains Mono, Consolas, monospace

#### Font Sizes
- **Display**: `4rem` (64px) - Hero headings
- **H1**: `3rem` (48px) - Page titles
- **H2**: `2.25rem` (36px) - Section headings
- **H3**: `1.875rem` (30px) - Subsection headings
- **H4**: `1.5rem` (24px) - Card titles
- **H5**: `1.25rem` (20px) - Small headings
- **Body Large**: `1.125rem` (18px) - Large body text
- **Body**: `1rem` (16px) - Default body text
- **Body Small**: `0.875rem` (14px) - Small text
- **Caption**: `0.75rem` (12px) - Captions and labels

#### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

#### Line Heights
- **Tight**: 1.25
- **Normal**: 1.5
- **Relaxed**: 1.625
- **Loose**: 2

## 🧩 Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background-color: #3B82F6;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.btn-primary:hover {
  background-color: #2563EB;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: white;
  color: #3B82F6;
  border: 2px solid #3B82F6;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #F9FAFB;
}
```

#### Button Variants
- **Small**: `text-sm px-3 py-2`
- **Large**: `text-lg px-6 py-3`
- **Full Width**: `w-full`
- **Disabled**: `opacity-50 cursor-not-allowed`

### Cards

#### Standard Card
```css
.card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: rgba(59, 130, 246, 0.3);
}
```

#### Card Variants
- **Elevated**: Enhanced shadow and gradient
- **Interactive**: Cursor pointer with scale transform
- **Material**: Cleaner design with subtle shadows
- **Exam Card**: Specialized for exam content

### Forms

#### Input Fields
```css
.input-field {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  box-shadow: 0 0 0 2px #3B82F6;
  border-color: transparent;
}
```

#### Form Elements
- **Text Input**: Standard input styling
- **Textarea**: Multi-line input with resize
- **Select**: Dropdown styling
- **Checkbox**: Custom checkbox design
- **Radio**: Custom radio button design

### Navigation

#### Navbar
- **Desktop**: Horizontal layout with logo and menu
- **Mobile**: Collapsible hamburger menu
- **Sticky**: Fixed positioning on scroll
- **Transparent**: Overlay mode for hero sections

#### Breadcrumbs
- **Separator**: Chevron right icon
- **Active**: Bold text with primary color
- **Inactive**: Gray text with hover states

### Layout Components

#### Container
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { padding: 0 1.5rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 2rem; }
}
```

#### Grid System
- **Responsive Grid**: Auto-fit columns with minmax
- **Card Grid**: Optimized for content cards
- **Sidebar Layout**: Main content with sidebar
- **Centered Layout**: Max-width containers

### Feedback Components

#### Loading States
```css
.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3B82F6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

#### Alert Messages
- **Success**: Green background with checkmark icon
- **Warning**: Yellow background with warning icon
- **Error**: Red background with error icon
- **Info**: Blue background with info icon

#### Toast Notifications
- **Position**: Top-right corner
- **Animation**: Slide in from right
- **Auto-dismiss**: 5 second timeout
- **Actions**: Dismiss button

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `0px - 639px`
- **Tablet**: `640px - 1023px`
- **Desktop**: `1024px - 1279px`
- **Large Desktop**: `1280px+`

### Mobile-First Approach
1. Design for mobile screens first
2. Enhance for larger screens
3. Use progressive enhancement
4. Test on real devices

### Responsive Patterns
- **Stack to Side-by-Side**: Mobile stacked, desktop side-by-side
- **Hide/Show**: Hide elements on smaller screens
- **Reorganize**: Change layout structure per breakpoint
- **Scale**: Adjust font sizes and spacing

## 🎭 Animation & Transitions

### Micro-interactions
- **Hover Effects**: Subtle color and shadow changes
- **Focus States**: Clear focus indicators
- **Loading States**: Smooth transitions between states
- **Button Press**: Scale down effect on click

### Page Transitions
- **Fade In**: Smooth opacity transitions
- **Slide**: Horizontal/vertical slide animations
- **Scale**: Zoom in/out effects
- **Stagger**: Sequential element animations

### Performance Considerations
- **GPU Acceleration**: Use transform and opacity
- **Reduced Motion**: Respect user preferences
- **Duration**: Keep animations under 300ms
- **Easing**: Use cubic-bezier for natural motion

## 🌍 Internationalization

### Language Support
- **English**: Primary language
- **Wolof**: Secondary language
- **RTL Support**: Right-to-left text direction
- **Font Fallbacks**: System font stacks

### Text Direction
- **LTR**: Left-to-right (English)
- **RTL**: Right-to-left (Arabic, Hebrew)
- **Auto**: Detect from language

### Cultural Considerations
- **Color Meanings**: Consider cultural color associations
- **Date Formats**: Localized date/time formats
- **Number Formats**: Regional number formatting
- **Currency**: Local currency symbols

## ♿ Accessibility

### WCAG Compliance
- **Level AA**: Minimum compliance target
- **Color Contrast**: 4.5:1 ratio for normal text
- **Focus Indicators**: Visible focus states
- **Keyboard Navigation**: Full keyboard support

### Screen Reader Support
- **Semantic HTML**: Proper heading structure
- **Alt Text**: Descriptive image alternatives
- **ARIA Labels**: Additional context for screen readers
- **Live Regions**: Announce dynamic content changes

### Visual Accessibility
- **High Contrast**: High contrast mode support
- **Font Scaling**: Support for larger text sizes
- **Motion Reduction**: Respect prefers-reduced-motion
- **Color Independence**: Don't rely solely on color

## 🛠️ Implementation Guidelines

### CSS Architecture
- **Utility-First**: TailwindCSS utility classes
- **Component Classes**: Custom component styles
- **CSS Variables**: Consistent design tokens
- **Scoped Styles**: Component-specific styling

### Component Structure
```jsx
// Component template
const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className="component-base-class">
      <div className="component-header">
        {/* Header content */}
      </div>
      <div className="component-body">
        {/* Main content */}
      </div>
    </div>
  );
};
```

### Best Practices
1. **Consistent Spacing**: Use design system spacing scale
2. **Semantic HTML**: Use proper HTML elements
3. **Performance**: Optimize for Core Web Vitals
4. **Testing**: Test across devices and browsers
5. **Documentation**: Document component usage

### Design Tokens
```javascript
// Design tokens object
const tokens = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#06B6D4',
    // ... other colors
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    // ... other spacing
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      // ... other sizes
    },
  },
};
```

This design system provides a comprehensive foundation for building consistent, accessible, and beautiful user interfaces for the Blue Orb platform.

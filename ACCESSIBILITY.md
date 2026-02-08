# Accessibility Documentation

**Ticket #148: Accessibility Improvements**

This document outlines the accessibility features implemented in the Mold web application to ensure it's usable by everyone, including people with disabilities.

## Overview

The application follows WCAG 2.1 Level AA guidelines and includes comprehensive accessibility features for:

- Screen reader users
- Keyboard-only users
- Users with visual impairments
- Users with motor disabilities
- Users who prefer reduced motion

## Implemented Features

### 1. Screen Reader Support

#### ARIA Labels
All interactive elements have descriptive ARIA labels:
- Buttons with icon-only content: `aria-label="Description"`
- Panels and regions: `role="region"` with descriptive labels
- Navigation: `role="navigation"` with `aria-label="Main navigation"`
- Forms: Proper `for`/`id` label associations

#### ARIA Live Regions
Dynamic content is announced to screen readers:
- Loading states: `aria-live="polite"`
- Error messages: `role="alert"` with `aria-live="assertive"`
- Success messages: `aria-live="polite"`
- Dynamic counters: `aria-live="polite"` with `aria-atomic="true"`

#### Heading Hierarchy
Proper heading structure (h1-h6) is maintained:
- One `h1` per page for the main title
- Logical nesting: `h1` → `h2` → `h3`, etc.
- Headings describe content sections

#### Image Alternatives
All images have appropriate alternatives:
- Informative images: Descriptive `alt` text
- Decorative images: `alt=""` or `aria-hidden="true"`
- Icons: `aria-hidden="true"` when decorative

### 2. Keyboard Navigation

#### Tab Order
Logical tab order following visual flow:
- No `tabindex > 0` (uses DOM order)
- Skip link allows jumping to main content
- Focus indicators are clearly visible

#### Focus Styles
Visible focus indicators for keyboard users:
- `:focus-visible` styles (not mouse focus)
- 3px outline with offset
- Theme-appropriate colors (pink for light, adjusted for dark modes)
- Chaos mode: animated pulse focus

#### Keyboard Shortcuts
Comprehensive keyboard shortcuts (press `?` for help):
- Navigation: `h` (home), `a` (about), `s` (settings), `p` (shop)
- Panels: `r` (rankings), `c` (cats), `f` (feed), `g` (goose)
- Actions: `/` (search), `n` (new ticket), `Esc` (close modals)
- Modes: `d` (dark), `z` (chaos), `q` (mold)

#### Interactive Elements
All interactive elements are keyboard accessible:
- Buttons: Activated with `Enter` and `Space`
- Links: Activated with `Enter`
- Forms: Proper tab order between fields
- Modals: Focus trapped, closed with `Escape`

### 3. Visual Accessibility

#### Focus Indicators
Clear focus states for keyboard navigation:
```css
:focus-visible {
  outline: 3px solid #ff6b9d;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 107, 157, 0.3);
}
```

#### Color Contrast
Text meets WCAG AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18px+ or bold 14px+): 3:1 contrast ratio
- UI components: 3:1 contrast ratio for graphical elements
- Tested with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

#### Text Scaling
Content supports text scaling up to 200%:
- Uses relative units (rem, %)
- Content reflows without horizontal scroll
- Breakpoints adapt to larger text sizes

#### High Contrast Mode
Respects `prefers-contrast: high` media query:
- Increased border widths
- Better visual separation
- Clearer boundaries

### 4. Motion and Animation

#### Reduced Motion
Respects `prefers-reduced-motion: reduce` preference:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Disabled animations for users who prefer less motion:
- Floating hearts
- Sparkles
- Bounce effects
- Chaos mode animations

#### Control Animations
Users can disable animations:
- Toggle chaos mode (`z` key)
- Toggle mold mode (`q` key)
- Settings panel has animation controls

### 5. Form Accessibility

#### Labeling
All form inputs have proper labels:
- Explicit labels with `for`/`id` attributes
- Placeholder text does not replace labels
- Required fields clearly marked

#### Error Handling
Form errors are accessible:
- Associated with inputs via `aria-describedby`
- Announced with `role="alert"`
- Clear, specific error messages
- Invalid state: `aria-invalid="true"`

#### Validation
Real-time feedback:
- ARIA attributes updated dynamically
- `aria-live` regions for status updates
- Visual and screen reader feedback

### 6. Modal and Dialog Accessibility

#### Focus Management
- Focus moves to modal when opened
- Focus trapped within modal
- Focus returns to trigger when closed
- `aria-modal="true"` indicates modal is active

#### Modal Attributes
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Title</h2>
</div>
```

#### Keyboard Control
- `Escape` key closes modal
- Tab cycles through modal content
- Focus is properly managed

### 7. Landmark Regions

Semantic HTML5 landmarks for navigation:
- `role="banner"`: Header with branding
- `role="navigation"`: Navigation menus
- `role="main"`: Main content area
- `role="complementary"`: Side panels
- `role="contentinfo"`: Footer information
- `role="search"`: Search functionality

### 8. Skip Links

Skip link for keyboard users:
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```
- Hidden until focused
- Allows jumping to main content
- Top priority in tab order

### 9. Testing and Validation

#### Automated Testing
Using `@axe-core/vue` for automated accessibility testing:
- Detects ARIA issues
- Checks color contrast
- Validates focus management
- Catches common accessibility problems

Run tests:
```bash
npm run test
```

#### Manual Testing Checklist
- [ ] Navigate with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA for Windows, VoiceOver for Mac)
- [ ] Verify color contrast ratios
- [ ] Test with reduced motion preference
- [ ] Test with high contrast mode
- [ ] Verify text scaling to 200%
- [ ] Test all interactive elements
- [ ] Check all form error messages
- [ ] Verify focus traps in modals

#### Browser DevTools
Use accessibility inspectors:
- Chrome: Accessibility pane in DevTools
- Firefox: Accessibility Inspector
- Safari: Accessibility Tree (via VoiceOver)

## Accessibility Best Practices

### DO:
- Use semantic HTML elements
- Provide descriptive labels
- Ensure sufficient color contrast
- Support keyboard navigation
- Announce dynamic content
- Test with assistive technologies

### DON'T:
- Use color alone to convey information
- Use `tabindex > 0`
- Hide focus indicators
- Use generic link text ("click here")
- Auto-play videos without controls
- Rely solely on visual feedback

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Checklist](https://webaim.org/standards/wcag/checklist)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Future Improvements

Planned accessibility enhancements:
- [ ] Enhanced mobile navigation
- [ ] Improved error message clarity
- [ ] Additional keyboard shortcuts
- [ ] Enhanced screen reader testing
- [ ] Accessibility audit tools integration

## Support

For accessibility issues or suggestions, please:
1. Create a ticket with tag "accessibility"
2. Include assistive technology used
3. Describe the issue in detail
4. Provide reproduction steps

---

**Last Updated:** February 9, 2026
**Ticket:** #148
**WCAG Level:** AA

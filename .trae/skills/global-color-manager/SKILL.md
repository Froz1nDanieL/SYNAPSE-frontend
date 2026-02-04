---
name: "global-color-manager"
description: "Manages and applies global color variables for consistent web design. Invoke when user needs to ensure all web pages follow the defined color scheme or when modifying color-related styles."
---

# Global Color Manager

This skill helps you maintain consistent color usage across your web application by leveraging the global color variables defined in `app/assets/css/global.css`.

## Color Variables Reference

Based on your global.css file, the following color variables are available:

| Variable Name | Value | Purpose |
|---------------|-------|---------|
| `--color-bg-primary` | `#f1efe9` | Main background color for web pages |
| `--color-text-primary` | `#282828` | Text color and button background color |
| `--color-accent-secondary` | `#e2ded1` | Secondary accent color for the web application |

## Usage Guidelines

### 1. Applying Background Color
Use `--color-bg-primary` for the main background of your pages:

```css
body {
  background-color: var(--color-bg-primary);
}

.container {
  background-color: var(--color-bg-primary);
}
```

### 2. Applying Text and Button Colors
Use `--color-text-primary` for text and button backgrounds:

```css
p, h1, h2, h3, h4, h5, h6 {
  color: var(--color-text-primary);
}

button {
  background-color: var(--color-text-primary);
  color: white; /* Contrast with dark button background */
}
```

### 3. Applying Secondary Accent Color
Use `--color-accent-secondary` for secondary elements:

```css
.card {
  border: 1px solid var(--color-accent-secondary);
}

.nav-item:hover {
  background-color: var(--color-accent-secondary);
}

.section-divider {
  background-color: var(--color-accent-secondary);
}
```

## Best Practices

1. **Always use variables**: Never hardcode colors in your stylesheets. Use the defined variables instead.

2. **Consistency is key**: Apply the same variable usage pattern across all components and pages.

3. **Update globally**: If you need to change a color, modify it only in the `global.css` file to ensure the change propagates throughout the entire application.

4. **Accessibility**: Ensure there's sufficient contrast between text and background colors. The current color scheme provides good contrast:
   - Text on primary background: #282828 on #f1efe9 (excellent contrast)
   - Text on secondary accent: #282828 on #e2ded1 (good contrast)

## Example Implementation

### For a typical page component:

```vue
<template>
  <div class="page-container">
    <h1>Welcome to My Page</h1>
    <p>This is a sample paragraph with primary text color.</p>
    <button class="primary-button">Click Me</button>
    <div class="accent-box">
      <p>This box uses the secondary accent color.</p>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  background-color: var(--color-bg-primary);
  padding: 20px;
}

h1, p {
  color: var(--color-text-primary);
}

.primary-button {
  background-color: var(--color-text-primary);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.accent-box {
  background-color: var(--color-accent-secondary);
  padding: 15px;
  margin-top: 20px;
  border-radius: 4px;
}

.accent-box p {
  color: var(--color-text-primary); /* Ensure text remains readable */
}
</style>
```

## Verification

To ensure your color usage is consistent:

1. Check that all CSS files import or reference the global color variables
2. Verify that no hardcoded colors are used in place of the variables
3. Test the application to ensure the color scheme appears consistent across all pages

By following these guidelines, you'll maintain a cohesive and professional-looking design throughout your entire web application.
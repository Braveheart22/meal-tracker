# UI Coding Standards

## Rule: shadcn/ui components only

All UI in this project must use **shadcn/ui** components. Custom UI components must not be created.

- **Do:** Import and use components from `@/components/ui/`
- **Do not:** Build custom buttons, inputs, dialogs, cards, or any other UI primitives from scratch

If a needed component does not yet exist in `src/components/ui/`, add it via the shadcn CLI:

```bash
npx shadcn@latest add <component-name>
```

Components are added to `src/components/ui/` and can be imported directly:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

## Styling

- Use **Tailwind CSS v4** utility classes for layout, spacing, and composition.
- Use the CSS custom properties defined in `src/app/globals.css` for colors and theming (e.g. `bg-primary`, `text-muted-foreground`, `border-border`). Do not hardcode color values.
- Dark mode is supported via the `.dark` class. Components automatically respect the theme tokens.
- The `cn()` utility from `@/lib/utils` merges class names and resolves conflicts — use it whenever combining conditional classes with component `className` props.

## Icons

Use **lucide-react** for all icons. Do not use other icon libraries.

```tsx
import { Utensils, Plus, Trash2 } from "lucide-react"
```

## Component composition

shadcn/ui components are composable primitives. Build page sections and features by composing them together rather than creating wrapper components. For example, a meal card is a `<Card>` with `<CardHeader>`, `<CardContent>`, and `<Button>` — not a custom `<MealCard>` component.

## Adding new components

Before building any UI element, check the [shadcn/ui component registry](https://ui.shadcn.com/docs/components) to see if a matching component exists. The full list of available components includes:

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `data-table`, `date-picker`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`, `toggle-group`, `tooltip`

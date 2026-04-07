# Plan: Matrix/Terminal Theme Redesign

## Context
Complete UI overhaul of Discordo to Matrix/hacker terminal aesthetic — neon green on black, monospace fonts, monochrome avatars, terminal-style UI elements, and improved mobile navigation with bottom drawer pattern.

---

## Changes

### 1. Global CSS — Matrix Color Palette (`src/app/globals.css`)

Replace all dark/neutral color variables with terminal palette:

```css
:root {
  --color-primary: #00FF41;       /* Matrix neon green */
  --color-primary-dark: #00CC33;
  --color-bg: #0D0D0D;            /* Near-black background */
  --color-bg-hover: #1A1A1A;
  --color-bg-active: #262626;
  --color-bg-sidebar: #0A0A0A;
  --color-border: #1F3D1F;
  --color-border-bright: #00FF41;
  --color-text: #00FF41;
  --color-text-dim: #008F2A;
  --color-text-muted: #004D1A;
  --color-cyan: #00D4FF;
  --color-warning: #FFD700;
  --color-error: #FF0040;
}
```

Remove all `[data-theme="light"]` overrides. Set body background to `#0D0D0D` and text to `#00FF41`.

Add scrollbar styling:
```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #0D0D0D; }
::-webkit-scrollbar-thumb { background: #00FF41; border-radius: 2px; }
::selection { background: #00FF41; color: #0D0D0D; }
```

### 2. Tailwind Config (`tailwind.config.ts`)

Replace blurple/dark tokens with Matrix tokens:

```typescript
colors: {
  primary: { DEFAULT: "#00FF41", dark: "#00CC33" },
  bg: { DEFAULT: "#0D0D0D", hover: "#1A1A1A", active: "#262626", sidebar: "#0A0A0A" },
  "border-bright": "#00FF41",
  cyan: "#00D4FF",
  warning: "#FFD700",
  error: "#FF0040",
  // Keep neutral for grayscale text
}
```

Remove `blurple`, `dark` color extensions.

### 3. Fonts — Matrix Font (`src/app/layout.tsx`)

Add `Share_Tech_Mono` (Google Fonts — terminal aesthetic):

```typescript
import { Share_Tech_Mono, JetBrains_Mono } from "next/font/google";

const matrixFont = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-matrix",
  weight: "400",
});
```

Apply `matrixFont.variable` to `<html>` alongside existing `jetbrainsMono.variable`.

### 4. Avatar Component (`src/components/ui/avatar.tsx`)

- Add CSS class: `filter grayscale(100%) brightness(0.9) contrast(1.1)`
- Change `rounded-full` → `rounded-sm` (square/terminal)
- Reduce size scale: xs=16px, sm=24px, md=32px, lg=40px
- Add green border glow on selection

### 5. Server List (`src/components/layout/server-list.tsx`)

- Background: `bg-bg-sidebar`
- Add left border: `border-l-2 border-border-bright`
- Home + guild icons: `grayscale(100%) brightness(0.8)`
- Selected guild: green glow `shadow-[0_0_8px_#00FF41]`
- Separator: `bg-border-bright` (bright green line)
- Theme toggle: green icon `text-primary`

### 6. Channel Sidebar (`src/components/layout/channel-sidebar.tsx`)

- Background: `bg-bg-sidebar`
- Header: border-bottom `border-b border-border-bright`
- DM list avatars: small (24px), square (`rounded-sm`)
- Active channel: `bg-primary/10 border-l-2 border-primary text-primary`
- Channel names: `text-primary font-mono text-sm`
- Section headers: uppercase, `text-text-dim`, small
- User footer: `bg-bg` border-top green border

### 7. Message List (`src/components/chat/message-list.tsx`)

- Author name: `text-primary font-mono`
- Timestamp: `text-text-dim text-xs`
- Message content: `text-primary`
- Hover: green glow `hover:bg-primary/5`
- System messages: cyan, centered
- Message separator: green horizontal line `bg-border-bright`
- Reaction badges: green border `border-primary`, `text-primary`

### 8. Chat Area Header (`src/components/chat/chat-area.tsx`)

- Border-bottom: `border-b border-border-bright`
- Channel name: `font-mono text-primary font-bold`
- Header icons: `text-cyan`

### 9. Message Input (`src/components/chat/message-input.tsx`)

- Container: `bg-bg-hover border border-border-bright rounded-sm`
- Text: `text-primary placeholder:text-text-muted`
- Send button: `text-primary hover:shadow-[0_0_8px_#00FF41]`

### 10. Login Page (`src/app/(auth)/login/page.tsx`)

Full Matrix terminal style:
- Background: `#0D0D0D`
- Title "DISCORDO": large `font-mono text-primary` with green text-shadow glow
- Blinking cursor after title (CSS animation)
- Input: terminal prompt style `bg-transparent border-b border-primary text-primary`
- Button: green border `border-primary text-primary hover:bg-primary hover:text-black`
- Subtle scanline CSS effect on background

### 11. Reaction Picker (`src/components/chat/reaction-picker.tsx`)

- Background: `bg-bg-sidebar border border-border-bright rounded-sm`
- Emoji buttons: `text-primary hover:bg-primary/10`
- Selected emoji: `text-primary`

### 12. Mobile Navigation (`src/components/layout/mobile-nav.tsx`, `mobile-bottom-bar.tsx`)

Replace current mobile nav with terminal-style bottom tab bar:

**Bottom Tab Bar (always visible):**
```
[🌐 Servers]  [# Channels/DMs]  [👤 Profile]
```
- Tabs: `text-text-dim`, active = `text-primary border-b-2 border-primary`
- Tapping a tab opens a bottom drawer/sheet sliding up

**Server Drawer** (slides up from left):
- Full-height sheet, `bg-bg-sidebar`
- Server icons in grid, grayscale
- Selected = green border

**Channel Drawer** (slides up from bottom):
- List of channels/DMs
- `text-primary font-mono`
- Active = green highlight

**Implementation**: Use a shared bottom sheet component with 3 tabs, each opening its respective drawer. Use CSS transforms for slide-up animation.

### 13. Scroll Button (`src/components/chat/message-list.tsx`)

- `bg-primary text-black hover:shadow-[0_0_12px_#00FF41]`

---

## Critical Files

| File | Changes |
|------|---------|
| `src/app/globals.css` | Full palette rewrite, scrollbar, selection, body bg |
| `tailwind.config.ts` | Replace blurple/dark tokens with Matrix tokens |
| `src/app/layout.tsx` | Add Share_Tech_Mono font |
| `src/components/ui/avatar.tsx` | Grayscale filter, square, smaller sizes |
| `src/components/layout/server-list.tsx` | Terminal styling, green glow |
| `src/components/layout/channel-sidebar.tsx` | Terminal styling, smaller DM avatars |
| `src/components/chat/message-list.tsx` | Green text, mono font, terminal hover |
| `src/components/chat/chat-area.tsx` | Green header border |
| `src/components/chat/message-input.tsx` | Terminal input style |
| `src/components/layout/mobile-nav.tsx` | Bottom tab bar with drawers |
| `src/components/chat/reaction-picker.tsx` | Terminal styling |
| `src/app/(auth)/login/page.tsx` | Full Matrix terminal login |

---

## Verification

1. `npm run build` — must pass
2. Login page: Matrix terminal aesthetic visible
3. Dashboard: green-on-black theme, grayscale avatars
4. Avatars: small (24px for DM list) and square
5. Messages: green monospace text
6. Mobile: bottom tab bar with slide-up drawers for servers/channels

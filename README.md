# Discordo Web

A lightweight Discord web client built with Next.js, Tailwind CSS, and Lucide Icons.

> ⚠️ **Warning**: Using a user token for personal accounts violates Discord's Terms of Service. Use at your own risk.

## Features

- 🔐 **Secure** — All API requests are made server-side. Your Discord token never reaches the browser.
- 💬 **Messages** — View and send messages with rich formatting, embeds, and image previews.
- 📁 **Channels** — Browse guild channels organized by category.
- 📨 **Direct Messages** — Access your DMs with an intuitive sidebar.
- 🔍 **Search** — Find messages within any channel.
- 🔔 **Notifications** — Browser push notifications for new messages (when tab is hidden).
- 📱 **Mobile-friendly** — Responsive design with touch-optimized controls.

## Setup

### 1. Get your Discord token

1. Open Discord in your browser at [discord.com/app](https://discord.com/app)
2. Open DevTools (`F12`) → **Application** tab
3. Go to **Local Storage** → `https://discord.com`
4. Find the key `token` and copy its value

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DISCORD_BOT_TOKEN=your_discord_user_token_here
ACCESS_PASSWORD=your-secure-password
JWT_SECRET=your-secure-random-string-at-least-32-characters-long
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your `ACCESS_PASSWORD`.

## Environment Variables

| Variable | Description |
|---|---|
| `DISCORD_BOT_TOKEN` | Your Discord user or bot token |
| `ACCESS_PASSWORD` | Password to access the web interface |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | JWT expiry (default: `8h`) |

## Tech Stack

- **Next.js 15** — App Router, Server Components
- **React Query** — Data fetching, caching, polling
- **Zustand** — Client state management
- **Tailwind CSS** — Utility-first styling
- **Lucide Icons** — Icon library
- **jose** — JWT signing (Edge-compatible)

## Architecture

```
src/
├── app/
│   ├── api/auth/          # JWT auth endpoints
│   ├── api/discord/      # Discord API proxy (server-side)
│   └── (dashboard)/      # Protected dashboard pages
├── components/
│   ├── chat/             # Message list, composer, search
│   ├── layout/           # Server list, channel sidebar
│   └── ui/               # Reusable UI components
├── hooks/
│   └── useNotifications.ts # Browser push notifications
├── lib/
│   ├── discord/          # Discord API client
│   ├── jwt.ts            # JWT utilities
│   └── utils.ts          # Shared helpers
└── stores/
    └── ui-store.ts       # Zustand UI state
```

## Roadmap

- [ ] Real-time updates via WebSocket gateway
- [ ] Typing indicators
- [ ] Message reactions
- [ ] File uploads
- [ ] Light/dark mode toggle
- [ ] PWA / installable app

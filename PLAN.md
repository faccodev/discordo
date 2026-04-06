# Discordo Web — Plano do Projeto

## 1. Visão Geral

Cliente web Discord com Next.js (App Router), TailwindCSS e Lucide Icons. Todas as requisições à API do Discord são feitas server-side via Route Handlers, mantendo o token seguro no servidor. Autenticação na interface via JWT.

**Stack:**
- Next.js 15 (App Router)
- TailwindCSS
- Lucide React (ícones)
- JWT (jose) para sessão
- React Query (TanStack Query) para cache/estado server-state
- Zustand para UI state client-side

---

## 2. Arquitetura

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/               # Página de login (email/senha → JWT)
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Layout com sidebar de servidores/canais
│   │   ├── page.tsx              # DM / canais favoritos
│   │   ├── [guildId]/
│   │   │   └── [channelId]/      # Chat do canal
│   └── api/                      # Route Handlers (server-side)
│       ├── auth/login/           # Gera JWT
│       ├── auth/logout/          # Invalida JWT
│       ├── discord/me/            # GET /users/@me
│       ├── discord/guilds/        # GET /users/@me/guilds
│       ├── discord/channels/      # GET /channels/:id
│       ├── discord/messages/      # GET /channels/:id/messages
│       ├── discord/dms/           # GET /users/@me/channels
│       └── discord/gateway/       # WS gateway info
│
├── components/
│   ├── ui/                       # Componentes base (Button, Input, Avatar...)
│   ├── layout/                   # Sidebar, Header, ServerList
│   ├── chat/                     # MessageList, MessageInput, Embed
│   └── discord/                  # GuildIcon, ChannelList, UserStatus
│
├── lib/
│   ├── discord/                  # Cliente Discord API (server-side)
│   │   ├── client.ts             # Fetch wrapper com headers corretos
│   │   ├── types.ts              # Tipos TypeScript da API do Discord
│   │   ├── endpoints.ts          # Constantes de endpoints
│   │   └── transformers.ts       # Normalização de dados
│   ├── jwt/                      # Assinatura/verificação JWT
│   └── utils.ts                  # Helpers
│
└── stores/
    └── ui-store.ts               # Zustand: sidebar colapsada, tema, etc.
```

---

## 3. Variáveis de Ambiente

```env
# Server-side (nunca expostas ao cliente)
DISCORD_BOT_TOKEN=          # Token de usuário Discord (self-bot - TOS)
JWT_SECRET=                  # Segredo para assinar JWTs (min 32 chars)
JWT_EXPIRES_IN=              # e.g. "7d"

# Opcional
DISCORD_API_BASE=https://discord.com/api/v10
```

---

## 4. Autenticação

### 4.1 Fluxo

```
Usuário → POST /api/auth/login { email, password }
       → Servidor valida credenciais (mock/config)
       → Gera JWT com claims: { sub: userId, email, role }
       → Retorna { token, expiresAt }
       → Cliente armazena em httpOnly cookie (ou localStorage)
```

### 4.2 proteções

- Route Handlers `/api/discord/*` exigem header `Authorization: Bearer <jwt>`
- Middleware verifica JWT em todas as rotas de `(dashboard)`
- Token Discord **nunca** sai do servidor

### 4.3 Login mock

Para MVP, login via email/senha configurado em `.env` (sem banco):
```env
ADMIN_EMAIL=admin@discordo.local
ADMIN_PASSWORD=sua_senha_segura
```

---

## 5. Funcionalidades

### 5.1 Servidores (Guilds)

- [ ] Sidebar esquerda com lista de servidores (ícone + nome)
- [ ] Expande/collapse sidebar
- [ ] Badge de notificações não lidas
- [ ] Guild icon (com fallback para inicial)
- [ ] Clica → mostra canais na sidebar

### 5.2 Canais

- [ ] Lista de canais por categoria (texto, voz, categorias)
- [ ] Ícones diferentes por tipo (#, 🔊, etc)
- [ ] Canal atual destacado
- [ ] Contador de mensagens não lidas

### 5.3 Mensagens (DM e Guild Channel)

- [ ] Lista de mensagens com scroll virtualizado
- [ ] Avatar, nome, timestamp do autor
- [ ] Menções formatadas (`@usuario`, `#canal`)
- [ ] Emojis customizados renderizados
- [ ] Mensagens do sistema (ex: "X entrou no servidor")
- [ ] Mensagens com imagem: `<img>` com lazy loading
- [ ] Embeds: título, descrição, cor, thumbnail, fields
- [ ] Link previews (og:title, og:description, og:image via fetch server-side)
- [ ] Mensagens com código (inline e blocks com syntax highlight)
- [ ] Timestamps amigáveis ("há 2 minutos", "ontem às 14:30")
- [ ] Carregar mais mensagens (paginação)
- [ ] Autores com roles coloridas (para guilds)

### 5.4 Input de Mensagem

- [ ] Textarea com placeholder
- [ ] Enter envia, Shift+Enter quebra linha
- [ ] Contador de caracteres (limite 2000)

### 5.5 DM (Mensagens Diretas)

- [ ] Aba de DMs na sidebar
- [ ] Lista de conversas com avatar e preview da última mensagem
- [ ] Abre DM ao clicar

---

## 6. API Discord (Server-Side)

### 6.1 Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/users/@me` | Perfil próprio |
| GET | `/users/@me/guilds` | Lista de servidores |
| GET | `/users/@me/channels` | DMs |
| GET | `/channels/:id` | Canal (nome, tipo) |
| GET | `/channels/:id/messages?limit=50&before=:id` | Mensagens |
| GET | `/guilds/:id/channels` | Canais do servidor |

### 6.2 Headers necessários (referenciados do discordo)

```typescript
const DISCORD_HEADERS = {
  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`, // ou Bearer para user token
  'Content-Type': 'application/json',
  'X-Super-Properties': base64(JSON.stringify({
    os: 'Windows',
    browser: 'Chrome',
    release_channel: 'stable',
    client_build_number: 482285,
  })),
  'Accept-Language': 'en-US',
  'Referer': 'https://discord.com/channels/@me',
}
```

### 6.3 Tipos principais

```typescript
interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

interface DiscordChannel {
  id: string;
  type: 0 | 1 | 2 | 4 | 5 | 11 | 13 | 15 | 16; // DM, GuildText, etc.
  name?: string;
  parent_id?: string;
  position?: number;
  last_message_id?: string;
}

interface DiscordMessage {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: DiscordUser;
  content: string;
  timestamp: string;
  edited_timestamp?: string;
  attachments: Attachment[];
  embeds: Embed[];
  mentions: Mention[];
  mention_roles: string[];
  type: number;
}

interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  url: string;
  proxy_url: string;
  width?: number;
  height?: number;
}

interface Embed {
  title?: string;
  description?: string;
  color?: number;
  url?: string;
  author?: { name: string; icon_url?: string };
  thumbnail?: { url: string };
  image?: { url: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; icon_url?: string };
  provider?: { name: string };
}
```

---

## 7. Componentes UI

### 7.1 Layout

- `ServerList` — coluna fina com ícones de servidores
- `ChannelSidebar` — lista de categorias e canais (colapsável)
- `ChatArea` — área principal de mensagens
- `MessageInput` — textarea no rodapé

### 7.2 Chat

- `MessageList` — container com scroll, virtualizado
- `MessageItem` — uma mensagem
- `EmbedCard` — embed renderizado (imagem, título, fields)
- `AttachmentImage` — imagem com lightbox
- `LinkPreview` — card de preview de link (fetch server-side)
- `Mention` — span estilizado para menções
- `CodeBlock` — syntax highlighting
- `SystemMessage` — mensagens de sistema (joins, etc)
- `TypingIndicator` — indicadores de digitação

### 7.3 Sidebar

- `GuildIcon` — avatar do servidor com fallback
- `ChannelList` — lista de canais agrupados
- `DirectMessages` — lista de DMs
- `UserStatusBadge` — bolinha de status online/idle/dnd/offline

---

## 8. Estilização

- **Tema**: Dark mode por padrão (como Discord)
- **Cores**: Slate/Zinc do Tailwind com algumas cores de accent ( blurple: #5865F2)
- **Tipografia**: Font mono para código (JetBrains Mono via next/font)
- **Animações**: Transições suaves para sidebar e modais

---

## 9. Segurança

- Token Discord **nunca** exposto ao client
- JWT com `httpOnly` cookie, `SameSite=Strict`
- Todos os `/api/discord/*` validam JWT antes de chamar Discord API
- Rate limiting básico nos endpoints
- Validação de inputs com Zod

---

## 10. Ordenação de Implementação

### Fase 1 — Foundation
1. Setup Next.js + Tailwind + Lucide
2. Variáveis de ambiente e lib JWT
3. Route Handler de login/logout
4. Middleware de autenticação
5. Layout base com sidebar

### Fase 2 — Discord API
6. Cliente Discord server-side (fetch wrapper)
7. GET /users/@me — perfil
8. GET /users/@me/guilds — servidores
9. GET /users/@me/channels — DMs
10. GET /guilds/:id/channels — canais do servidor

### Fase 3 — Chat Core
11. MessageList com renderização básica
12. Avatares, nomes, timestamps
13. Scroll e paginação de mensagens
14. Componente EmbedCard

### Fase 4 — Rich Content
15. Attachments (imagens)
16. Link Previews
17. Menções formatadas
18. Código inline e blocks
19. Emojis customizados

### Fase 5 — UX
20. Mensagens de sistema
21. Badge de notificações
22. Input de mensagem
23. Carregar mais mensagens
24. Codespaces / Docker

---

## 11. Observações Importantes

- **TOS Discord**: Self-bots violam TOS. Para produção, usar OAuth2 com bot token é o caminho correto.
- **Rate Limits**: Discord tem rate limits agressivos — implementar backoff exponencial.
- **Gateway WebSocket**: Não implementado no MVP. Mensagens em tempo real via polling ou WebSocket separado.
- **Cache**: React Query com staleTime agressivo para reduzir chamadas.

<p align="center">
  <img src="./project-logo.png" width="200" />
</p>

<p align="center">
This Node.js SDK provides seamless integration with an Authula server for client-side and server-side applications. Import only the pieces you need from a framework subpath.
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/authula" target="_parent">
    <img src="https://img.shields.io/npm/dm/authula.svg" alt="Node.js SDK downloads" />
  </a>
</div>

<div align="center">

### [Become a Sponsor!](https://dub.sh/PrJb7W9)

</div>

---

## Features

- **Framework subpaths**: `authula/core`, `authula/models`, `authula/plugins`, `authula/zod`, `authula/react`, `authula/vue`, `authula/solid`, `authula/svelte`
- **Full TypeScript Support**: Complete TypeScript definitions with strict typing
- **CSRF Protection**: Automatic CSRF token handling for mutating requests
- **Multiple Auth Methods**: Email/password, OAuth2, JWT-based authentication
- **Plugin Architecture**: Extensible plugin system for custom authentication flows
- **Automatic Token Refresh**: Built-in bearer token refresh mechanism
- **Built-in Zod and TanStack Query support**: Zod schemas from `authula/zod` and per-framework TanStack Query hooks

## Installation

Install `authula` plus the TanStack Query adapter for your framework:

```bash
# React
pnpm add authula @tanstack/react-query

# Vue
pnpm add authula @tanstack/vue-query

# Solid
pnpm add authula @tanstack/solid-query

# Svelte
pnpm add authula @tanstack/svelte-query
```

The framework runtime (`react`, `vue`, `solid-js`, `svelte`) is already present in
your app and is declared as an optional peer, not installed by `authula`.

Core-only/server users need no query adapter and no framework runtime:

```bash
pnpm add authula
```

## Imports

| Import            | Contents                                                               |
| ----------------- | ---------------------------------------------------------------------- |
| `authula/core`    | `AuthulaClient`, core `createClient` (direct methods only), `ApiError` |
| `authula/models`  | Generated TypeScript models and enum values                            |
| `authula/zod`     | Generated Zod schemas                                                  |
| `authula/plugins` | Plugin classes                                                         |
| `authula/react`   | React `createClient`, hooks/types, core re-export                      |
| `authula/vue`     | Vue `createClient`, hooks/types, core re-export                        |
| `authula/solid`   | Solid `createClient`, hooks/types, core re-export                      |
| `authula/svelte`  | Svelte `createClient`, hooks/types, core re-export                     |

There is no `authula` root import. Always use a subpath.

## Quick Start

Import `createClient` from your framework subpath. The client it returns has
both direct methods and that framework's query hooks attached to each plugin:

```ts
const client = createClient({ url, plugins: [new CorePlugin()] });

await client.core.getMe(); // direct request method
client.core.useGetMe(); // React/Vue/Solid hook
client.core.createGetMe(); // Svelte hook
```

Hooks are bound to the client instance that created them, so their URL, cookies,
and CSRF/bearer hooks always come from that client. They still use the TanStack
Query client from your app's `QueryClientProvider` (or equivalent).

### React

```tsx
import { createClient } from "authula/react";
import { CorePlugin, EmailPasswordPlugin } from "authula/plugins";

const client = createClient({
  url: "http://localhost:8080/api/auth",
  plugins: [new CorePlugin(), new EmailPasswordPlugin()],
});

function Profile() {
  const { data, isLoading, isError } = client.core.useGetMe();
  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Not signed in</p>;
  return <p>{data?.user?.email}</p>;
}
```

### Vue

```vue
<script setup lang="ts">
import { createClient } from "authula/vue";
import { CorePlugin, EmailPasswordPlugin } from "authula/plugins";

const client = createClient({
  url: "http://localhost:8080/api/auth",
  plugins: [new CorePlugin(), new EmailPasswordPlugin()],
});

const { data, isLoading, isError } = client.core.useGetMe();
</script>

<template>
  <p v-if="isLoading">Loading…</p>
  <p v-else-if="isError">Not signed in</p>
  <p v-else>{{ data?.user?.email }}</p>
</template>
```

### Solid

```tsx
import { createClient } from "authula/solid";
import { CorePlugin, EmailPasswordPlugin } from "authula/plugins";

const client = createClient({
  url: "http://localhost:8080/api/auth",
  plugins: [new CorePlugin(), new EmailPasswordPlugin()],
});

function Profile() {
  const query = client.core.useGetMe();
  if (query.isLoading) return <p>Loading…</p>;
  if (query.isError) return <p>Not signed in</p>;
  return <p>{query.data?.user?.email}</p>;
}
```

### Svelte

```svelte
<script lang="ts">
  import { createClient } from "authula/svelte";
  import { CorePlugin, EmailPasswordPlugin } from "authula/plugins";

  const client = createClient({
    url: "http://localhost:8080/api/auth",
    plugins: [new CorePlugin(), new EmailPasswordPlugin()],
  });

  const query = client.core.createGetMe();
</script>

{#if $query.isLoading}
  <p>Loading…</p>
{:else if $query.isError}
  <p>Not signed in</p>
{:else}
  <p>{$query.data?.user?.email}</p>
{/if}
```

Raw hooks are still exported from each framework subpath for convenience:

```ts
import { createClient, useGetMe } from "authula/react";
```

The raw hook resolves the most recently created client as its default. Prefer
`client.core.useGetMe()` when you need a specific client instance, such as SSR.

### Direct methods and models

For server-side or core-only usage, import `createClient` from `authula/core`.
It provides direct methods without query hooks:

```ts
import { createClient } from "authula/core";
import { CorePlugin } from "authula/plugins";
import type { User } from "authula/models";

const client = createClient({
  url: "http://localhost:8080/api/auth",
  plugins: [new CorePlugin()],
});

const me = await client.core.getMe();

const user: User = me.user;
```

### Zod schemas

```ts
import * as schemas from "authula/zod";

const result = schemas.SignInRequest.safeParse(input);
```

## Server-side rendering

- Client-bound hooks (`client.core.useGetMe()`) use the cookies and URL of the
  client instance they came from, so create one client per request when using
  hooks during SSR.
- Use direct client methods (`await client.core.getMe()`) when possible.
- Raw hook imports (`import { useGetMe } from "authula/react"`) use the most
  recently created client globally, so avoid them for request-scoped SSR.
- Per-call overrides are supported and take precedence over the client config:
  `client.core.useGetMe({ request: { baseUrl, cookies } })`.

```ts
import { cookies } from "next/headers";

import { createClient } from "authula/react";
import { CorePlugin } from "authula/plugins";

const client = createClient({
  url: "http://localhost:8080/api/auth",
  plugins: [new CorePlugin()],
  cookies,
});

const me = await client.core.getMe();
```

## Available Plugins

The following plugins are available in this SDK:

- Core
- Access Control
- Admin
- Organizations
- API Key
- Email Password
- OAuth2
- CSRF
- JWT
- Bearer
- Magic Link
- TOTP

## Advanced Configuration

### Fetch Options

```typescript
const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  fetchOptions: {
    abortTimeout: 30, // Timeout in seconds
    headers: {}, // Custom headers
  },
  plugins: [
    // your plugins
  ],
});
```

### Custom Hooks

```typescript
const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new CorePlugin()],
});

authulaClient.registerBeforeFetch(async (ctx) => {
  console.log(`Making request to: ${ctx.url}`);
  ctx.init.headers = {
    ...ctx.init.headers,
    "X-Custom-Header": "value",
  };
});

authulaClient.registerAfterFetch(async (ctx, response) => {
  console.log(`Received response: ${response.status}`);
});
```

## Migration from 0.7.x to 0.8.0

| Before                                   | After                                                              |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `import { createClient } from "authula"` | `import { createClient } from "authula/react"` (or your framework) |
| `import type { User } from "authula"`    | `import type { User } from "authula/models"`                       |
| `client.core.useGetMe()`                 | unchanged when `createClient` comes from a framework subpath       |
| `authula/plugins`                        | unchanged                                                          |
| zod schemas inaccessible                 | `import * as schemas from "authula/zod"`                           |

For core-only or server code, `authula/core` also exports `createClient`, but its
clients expose direct methods only (no query hooks).

`@tanstack/react-query` was previously a direct dependency and is now an optional
peer, so existing React users must add it explicitly. The same applies to the
other TanStack adapters and to the framework runtimes (`react`, `vue`,
`solid-js`, `svelte`), which are optional peers supplied by your app.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

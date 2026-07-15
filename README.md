<p align="center">
  <img src="./project-logo.png" width="200" />
</p>

<p align="center">
This Node.js SDK provides seamless integration with an Authula server for both client-side and server-side applications and is framework agnostic.
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/authula" target="_parent">
    <img src="https://img.shields.io/npm/dm/authula.svg" alt="Node.js SDK downloads" />
  </a>
</div>

---

## 🚨 Breaking Changes

Starting with v0.6.x, the SDK transitions to an automated, schema-driven architecture powered by Orval. Code generation is now tied 1-to-1 with the Authula backend OpenAPI specification, ensuring absolute parity and enhanced reliability.

This architectural shift introduces several breaking changes to the SDK footprint:

1. Relocation of Core Methods

   What changed: Core utility methods have been consolidated.

   Impact: Any foundational system methods have moved directly into the Core Plugin namespace, as the underlying Authula engine now explicitly groups these operations under the core OpenAPI tag.

2. Standardized Method Signatures via Orval

   What changed: Every Authula plugin now exposes its feature set via auto-generated endpoints.

   Impact: While plugins remain organized under their original top-level objects, individual method names, parameters, and payloads may have changed to match the strict schema specification.

3. Unified Server & Client Support

   The Benefit: Each plugin now natively exports decoupled, standalone methods optimized for server-side execution, alongside fully typed TanStack Query hooks dedicated to client-side web applications.

   Why this matters: Moving forward, this SDK will perfectly mirror upstream backend updates with zero drift, drastically reducing runtime bugs and offering complete type safety across your entire stack.

## Features

- **Framework Agnostic**: Works with Next.js/React, Vue.js and more
- **Full TypeScript Support**: Complete TypeScript definitions with strict typing
- **CSRF Protection**: Automatic CSRF token handling for mutating requests
- **Multiple Auth Methods**: Email/password, OAuth2, JWT-based authentication
- **Plugin Architecture**: Extensible plugin system for custom authentication flows
- **Automatic Token Refresh**: Built-in bearer token refresh mechanism
- **Built-in support for Zod and Tanstack Query**: provides types and zod schemas out of the box along with tanstack query code for all available methods.

## Installation

```bash
npm install authula
# or
yarn add authula
# or
pnpm add authula
```

## Quick Start

### Basic Setup

`Client instance`:

Use with SPA (Vite etc.)

```typescript
import { createClient } from "authula";
import { CorePlugin, EmailPasswordPlugin } from "authula/plugins";

const authulaBrowserClient = createClient({
  // Your Authula server URL
  url: "http://localhost:8080/api/auth",
  plugins: [new CorePlugin(), new EmailPasswordPlugin()],
});

// Direct method call
const response = await authulaBrowserClient.core.getMe();

// Tanstack Query
const { data, error, isLoading, isError } =
  await authulaBrowserClient.core.useGetMe();
```

`Server instance`:

Use with SSR frameworks e.g. Next.js/Tanstack Start etc.

```typescript
import { cookies } from "next/headers";

import { createClient } from "authula";
import { CorePlugin, EmailPasswordPlugin } from "authula/plugins";

const authulaServerClient = createClient({
  // Your Authula server URL
  url: "http://localhost:8080/api/auth",
  plugins: [new CorePlugin(), new EmailPasswordPlugin()],
  // For frameworks other than Next.js, you may need to implement this cookies object manually by implementing the interface.
  cookies: cookies,
});

// Now you can use the client...

const response = await authulaServerClient.core.getMe();
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

Configure fetch behavior with timeout and other options:

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

Add custom before/after fetch hooks for advanced customization:

```typescript
const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new CorePlugin()],
});

// Register a before fetch hook
authulaClient.registerBeforeFetch(async (ctx) => {
  console.log(`Making request to: ${ctx.url}`);
  // Modify context if needed
  ctx.init.headers = {
    ...ctx.init.headers,
    "X-Custom-Header": "value",
  };
});

// Register an after fetch hook
authulaClient.registerAfterFetch(async (ctx, response) => {
  console.log(`Received response: ${response.status}`);
  if (response.status >= 400) {
    // Handle error
  }
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

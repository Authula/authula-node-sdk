<p align="center">
GoBetterAuth Node.js SDK
</p>

<p align="center">
<img src="./project-logo.png" width="100" />
</p>

<p align="center">
This SDK provides seamless integration with a GoBetterAuth server for both client-side and server-side applications and is framework agnostic.
</p>

---

## Features

- **Framework Agnostic**: Works with Next.js/React, Vue.js and more
- **Full TypeScript Support**: Complete TypeScript definitions with strict typing
- **SSR Safe**: Supports proper cookie handling for SSR apps
- **CSRF Protection**: Automatic CSRF token handling for mutating requests
- **Multiple Auth Methods**: Email/password, OAuth2, JWT-based authentication
- **Plugin Architecture**: Extensible plugin system for custom authentication flows
- **Automatic Token Refresh**: Built-in bearer token refresh mechanism

## Installation

```bash
npm install go-better-auth
# or
yarn add go-better-auth
# or
pnpm add go-better-auth
```

## Quick Start

### Basic Setup

```typescript
import { createClient } from "go-better-auth";
import { EmailPasswordPlugin } from "go-better-auth/plugins";

// Create a client instance
const goBetterAuthClient = createClient({
  // Your GoBetterAuth server URL
  url: "http://localhost:8080/auth",
  plugins: [new EmailPasswordPlugin()],
});

// Now you can use the client to perform authentication operations
```

### Using with Cookies (SSR Compatible)

For server-side rendering or applications that need to handle cookies properly:

```typescript
import { cookies } from "next/headers";

import { createClient } from "go-better-auth";
import { EmailPasswordPlugin, CSRFPlugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  cookies: cookies, // Provide cookie store for SSR
  plugins: [
    new EmailPasswordPlugin(),
    new CSRFPlugin({
      cookieName: "csrf_token",
      headerName: "X-CSRF-TOKEN",
    }),
  ],
});
```

## Core Client Methods

The client provides built-in methods for essential authentication operations:

### Get Current User

Retrieve information about the currently authenticated user:

```typescript
const { user, session } = await goBetterAuthClient.getMe();

console.log(user.email);
console.log(session.id);
```

### Sign Out

Sign out the current user or all sessions:

```typescript
// Sign out current session
await goBetterAuthClient.signOut({});

// Sign out all sessions
await goBetterAuthClient.signOut({
  signOutAll: true,
});

// Sign out a specific session
await goBetterAuthClient.signOut({
  sessionId: "session-id",
});
```

### Get Plugin Instance

Access a plugin instance programmatically:

```typescript
const emailPasswordPlugin = goBetterAuthClient.getPlugin("emailPassword");

// Use the plugin
if (emailPasswordPlugin) {
  // Plugin methods are now available
}
```

## Available Plugins

### Access Control Plugin

Provides role-based access control (RBAC) management for users, including roles, permissions, and their assignments.

```typescript
import { AccessControlPlugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new AccessControlPlugin()],
});
```

#### Role Management

```typescript
// Create a new role
await goBetterAuthClient.accessControl.createRole({
  name: "Admin",
  description: "Administrator role",
  isSystem: false,
});

// Get all roles
const allRoles = await goBetterAuthClient.accessControl.getAllRoles();

// Get a specific role
const role = await goBetterAuthClient.accessControl.getRoleById("role-id");

// Update a role
await goBetterAuthClient.accessControl.updateRole("role-id", {
  name: "Updated name",
  description: "Updated description",
});

// Delete a role
await goBetterAuthClient.accessControl.deleteRole("role-id");
```

#### Permission Management

```typescript
// Create a new permission
await goBetterAuthClient.accessControl.createPermission({
  key: "users.create",
  description: "Create new users",
  isSystem: false,
});

// Get all permissions
const allPermissions = await goBetterAuthClient.accessControl.getAllPermissions();

// Update a permission
await goBetterAuthClient.accessControl.updatePermission("permission-id", {
  description: "Updated permission description",
});

// Delete a permission
await goBetterAuthClient.accessControl.deletePermission("permission-id");
```

#### Role-Permission Management

```typescript
// Add a permission to a role
await goBetterAuthClient.accessControl.addRolePermission("role-id", {
  permissionId: "permission-id",
});

// Get all permissions for a role
const rolePermissions = await goBetterAuthClient.accessControl.getRolePermissions(
  "role-id",
);

// Replace all permissions for a role
await goBetterAuthClient.accessControl.replaceRolePermissions("role-id", {
  permissionIds: ["permission-id-1", "permission-id-2", "permission-id-3"],
});

// Remove a permission from a role
await goBetterAuthClient.accessControl.removeRolePermission(
  "role-id",
  "permission-id",
);
```

#### User Role Management

```typescript
// Get all roles assigned to a user
const userRoles = await goBetterAuthClient.accessControl.getUserRoles("user-id");

// Assign a role to a user
await goBetterAuthClient.accessControl.assignUserRole("user-id", {
  roleId: "role-id",
  expiresAt: new Date("2025-12-31"), // Optional: role expiration date
});

// Replace all roles for a user
await goBetterAuthClient.accessControl.replaceUserRoles("user-id", {
  roleIds: ["role-id-1", "role-id-2"],
});

// Remove a role from a user
await goBetterAuthClient.accessControl.removeUserRole("user-id", "role-id");
```

#### User Permission Management

```typescript
// Get all effective permissions for a user (from all assigned roles)
const userPermissions = await goBetterAuthClient.accessControl.getUserEffectivePermissions("user-id");
```

---

### Admin Plugin

Provides the ability to manage users, accounts, sessions, and impersonations.

```typescript
import { AdminPlugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new AdminPlugin()],
});
```

#### User Management

```typescript
await goBetterAuthClient.admin.createUser({
  name: "John Doe",
  email: "user@example.com",
  // other fields...
});

// Get all users with pagination
const users = await goBetterAuthClient.admin.getAllUsers(100);

// Get a specific user by ID
const user = await goBetterAuthClient.admin.getUserById("user-id");

// Update user information
await goBetterAuthClient.admin.updateUser("user-id", { name: "Jane" });

// Delete a user
await goBetterAuthClient.admin.deleteUser("user-id");
```

#### Account Management

```typescript
// Create a new account for a user
await goBetterAuthClient.admin.createAccount("user-id", { /* account data */ });

// Get all accounts for a user
await goBetterAuthClient.admin.getUserAccounts("user-id");

// Get a specific account by ID
await goBetterAuthClient.admin.getAccountById("account-id");

// Update account information
await goBetterAuthClient.admin.updateAccount("account-id", { /* data */ });

// Delete an account
await goBetterAuthClient.admin.deleteAccount("account-id");
```

#### User State Management

```typescript
// Get user state
await goBetterAuthClient.admin.getUserState("user-id");

// Create or update user state
await goBetterAuthClient.admin.createUserState("user-id", { /* state data */ });

// Update user state
await goBetterAuthClient.admin.updateUserState("user-id", { /* state data */ });

// Delete user state
await goBetterAuthClient.admin.deleteUserState("user-id");

// Get all banned user states
await goBetterAuthClient.admin.getBannedUserStates();

// Ban a user
await goBetterAuthClient.admin.banUser("user-id", { reason: "reason..." });

// Unban a user
await goBetterAuthClient.admin.unbanUser("user-id");

// Get all active sessions for a user
await goBetterAuthClient.admin.getUserAdminSessions("user-id");
```

#### Session State Management

```typescript
// Get session state
await goBetterAuthClient.admin.getSessionState("session-id");

// Create or update session state
await goBetterAuthClient.admin.createSessionState("session-id", { /* data */ });

// Update session state
await goBetterAuthClient.admin.updateSessionState("session-id", { /* data */ });

// Delete session state
await goBetterAuthClient.admin.deleteSessionState("session-id");

// Get all revoked session states
await goBetterAuthClient.admin.getRevokedSessionStates();

// Revoke a session
await goBetterAuthClient.admin.revokeSession("session-id", { reason: "reason..." });
```

#### Impersonations

```typescript
// Get all active impersonations
await goBetterAuthClient.admin.getAllImpersonations();

// Get a specific impersonation by ID
await goBetterAuthClient.admin.getImpersonationById("impersonation-id");

// Start impersonating a user
await goBetterAuthClient.admin.startImpersonation({ user_id: "user-id", /* data */ });

// Stop impersonation
await goBetterAuthClient.admin.stopImpersonation("impersonation-id");
```

---

### Email Password Plugin

Handles traditional email/password authentication flows.

```typescript
import { EmailPasswordPlugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new EmailPasswordPlugin()],
});

// Sign up
await goBetterAuthClient.emailPassword.signUp({
  name: "John Doe",
  email: "john@example.com",
  password: "securePassword123",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Sign in
const response = await goBetterAuthClient.emailPassword.signIn({
  email: "john@example.com",
  password: "securePassword123",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Send email verification
await goBetterAuthClient.emailPassword.sendEmailVerification({
  email: "john@example.com",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Request password reset
await goBetterAuthClient.emailPassword.requestPasswordReset({
  email: "john@example.com",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Change password
await goBetterAuthClient.emailPassword.changePassword({
  token: "reset-token",
  password: "newSecurePassword123",
});

// Request email change
await goBetterAuthClient.emailPassword.requestEmailChange({
  email: "john.doe@example.com",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});
```

---

### OAuth2 Plugin

Handles OAuth2 authentication with popular providers.

```typescript
import { OAuth2Plugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new OAuth2Plugin()],
});

// Redirect user to OAuth2 provider
const response = await goBetterAuthClient.oauth2.signIn({
  provider: "google", // or "github", "discord"
  redirect_to: "http://localhost:3000/callback",
});

// Redirect user to the authUrl
window.location.href = response.auth_url;
```

---

### CSRF Plugin

Provides automatic CSRF protection for mutating requests.

```typescript
import { CSRFPlugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  cookies: ..., // Provide cookie store for SSR if needed, else omit for SPA/Mobile apps
  plugins: [
    new CSRFPlugin({
      cookieName: "csrf_token",    // Name of the CSRF token cookie
      headerName: "X-CSRF-TOKEN"   // Header name to send the token
    })
  ]
});

// CSRF tokens will be automatically added to mutating requests (POST, PUT, PATCH, DELETE)
```

---

### JWT Plugin

Handles JWT token operations including refresh.

```typescript
import { JWTPlugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new JWTPlugin()],
});

// Refresh JWT tokens
const tokens = await goBetterAuthClient.jwt.refreshToken({
  refresh_token: "your-refresh-token",
});

// Get JWKS keys
const jwksKeys = await goBetterAuthClient.jwt.getJWKSKeys();
```

---

### Bearer Plugin

Provides automatic bearer token handling and refresh.

```typescript
import { BearerPlugin, JWTPlugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [
    new JWTPlugin(),
    new BearerPlugin({
      headerName: "Authorization", // Can be omitted as default is Authorization
    }),
  ],
});

// The Bearer plugin will automatically:
// 1. Add Authorization: Bearer <token> header to requests
// 2. Handle token refresh when receiving 401 responses
// 3. Store tokens in localStorage (access_token and refresh_token)
```

---

### Magic Link Plugin

Provides flows for passwordless authentication.

```typescript
import { MagicLinkPlugin } from "go-better-auth/plugins";

const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new MagicLinkPlugin()],
});

// Send magic link via email
await goBetterAuthClient.magicLink.signIn({
  email: "john.doe@example.com",
  name: "John Doe", // Optional name
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Verify magic link token
await goBetterAuthClient.magicLink.verify({
  token: "magic-link-token",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Exchange token from verify endpoint for session
await goBetterAuthClient.magicLink.exchange({
  token: "magic-link-token",
});
```

## Advanced Configuration

### Fetch Options

Configure fetch behavior with timeout and other options:

```typescript
const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  fetchOptions: {
    abortTimeout: 30, // Timeout in seconds
  },
  plugins: [
    // your plugins
  ],
});
```

### Custom Hooks

Add custom before/after fetch hooks for advanced customization:

```typescript
const goBetterAuthClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new EmailPasswordPlugin()],
});

// Register a before fetch hook
goBetterAuthClient.registerBeforeFetch(async (ctx) => {
  console.log(`Making request to: ${ctx.url}`);
  // Modify context if needed
  ctx.init.headers = {
    ...ctx.init.headers,
    "X-Custom-Header": "value",
  };
});

// Register an after fetch hook
goBetterAuthClient.registerAfterFetch(async (ctx, response) => {
  console.log(`Received response: ${response.status}`);
  if (response.status >= 400) {
    // Handle error
  }
});
```

## API Reference

### Client Configuration

```typescript
{
  // Base URL of your GoBetterAuth server
  url: string,
  // Optional fetch configuration
  fetchOptions?: {
    // Request timeout in seconds
    abortTimeout?: number
  },
  // Cookie provider for SSR compatibility
  cookies?: () => CookieStore
}
```

## Error Handling

All methods return promises that can be caught for error handling:

```typescript
try {
  const response = await goBetterAuthClient.emailPassword.signIn({
    email: "user@example.com",
    password: "password",
  });
  console.log("Signed in successfully", response);
} catch (error) {
  console.error("Sign in failed:", error);
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.


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
npm install authula
# or
yarn add authula
# or
pnpm add authula
```

## Quick Start

### Basic Setup

```typescript
import { createClient } from "authula";
import { EmailPasswordPlugin } from "authula/plugins";

// Create a client instance
const authulaClient = createClient({
  // Your Authula server URL
  url: "http://localhost:8080/auth",
  plugins: [new EmailPasswordPlugin()],
});

// Now you can use the client to perform authentication operations
```

### Using with Cookies (SSR Compatible)

For server-side rendering or applications that need to handle cookies properly:

```typescript
import { cookies } from "next/headers";

import { createClient } from "authula";
import { EmailPasswordPlugin, CSRFPlugin } from "authula/plugins";

const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  cookies: cookies, // Provide cookie store for SSR
  plugins: [
    new EmailPasswordPlugin(),
    new CSRFPlugin({
      cookieName: "authula_csrf_token",
      headerName: "X-AUTHULA-CSRF-TOKEN",
    }),
  ],
});
```

## Core Client Methods

The client provides built-in methods for essential authentication operations:

### Get Current User

Retrieve information about the currently authenticated user:

```typescript
const { user, session } = await authulaClient.getMe();

console.log(user.email);
console.log(session.id);
```

### Sign Out

Sign out the current user or all sessions:

```typescript
// Sign out current session
await authulaClient.signOut({});

// Sign out all sessions
await authulaClient.signOut({
  signOutAll: true,
});

// Sign out a specific session
await authulaClient.signOut({
  sessionId: "session-id",
});
```

### Get Plugin Instance

Access a plugin instance programmatically:

```typescript
const emailPasswordPlugin = authulaClient.getPlugin("emailPassword");

// Use the plugin
if (emailPasswordPlugin) {
  // Plugin methods are now available
}
```

## Available Plugins

### Access Control Plugin

Provides role-based access control (RBAC) management for users, including roles, permissions, and their assignments.

```typescript
import { AccessControlPlugin } from "authula/plugins";

const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new AccessControlPlugin()],
});
```

#### Role Management

```typescript
// Create a new role
await authulaClient.accessControl.createRole({
  name: "Admin",
  description: "Administrator role",
  isSystem: false,
});

// Get all roles
const allRoles = await authulaClient.accessControl.getAllRoles();

// Get a specific role
const role = await authulaClient.accessControl.getRoleById("role-id");

// Update a role
await authulaClient.accessControl.updateRole("role-id", {
  name: "Updated name",
  description: "Updated description",
});

// Delete a role
await authulaClient.accessControl.deleteRole("role-id");
```

#### Permission Management

```typescript
// Create a new permission
await authulaClient.accessControl.createPermission({
  key: "users.create",
  description: "Create new users",
  isSystem: false,
});

// Get all permissions
const allPermissions = await authulaClient.accessControl.getAllPermissions();

// Update a permission
await authulaClient.accessControl.updatePermission("permission-id", {
  description: "Updated permission description",
});

// Delete a permission
await authulaClient.accessControl.deletePermission("permission-id");
```

#### Role-Permission Management

```typescript
// Add a permission to a role
await authulaClient.accessControl.addRolePermission("role-id", {
  permissionId: "permission-id",
});

// Get all permissions for a role
const rolePermissions = await authulaClient.accessControl.getRolePermissions(
  "role-id",
);

// Replace all permissions for a role
await authulaClient.accessControl.replaceRolePermissions("role-id", {
  permissionIds: ["permission-id-1", "permission-id-2", "permission-id-3"],
});

// Remove a permission from a role
await authulaClient.accessControl.removeRolePermission(
  "role-id",
  "permission-id",
);
```

#### User Role Management

```typescript
// Get all roles assigned to a user
const userRoles = await authulaClient.accessControl.getUserRoles("user-id");

// Assign a role to a user
await authulaClient.accessControl.assignUserRole("user-id", {
  roleId: "role-id",
  expiresAt: new Date("2025-12-31"), // Optional: role expiration date
});

// Replace all roles for a user
await authulaClient.accessControl.replaceUserRoles("user-id", {
  roleIds: ["role-id-1", "role-id-2"],
});

// Remove a role from a user
await authulaClient.accessControl.removeUserRole("user-id", "role-id");
```

#### User Permission Management

```typescript
// Get all effective permissions for a user (from all assigned roles)
const userPermissions = await authulaClient.accessControl.getUserEffectivePermissions("user-id");
```

---

### Admin Plugin

Provides the ability to manage users, accounts, sessions, and impersonations.

```typescript
import { AdminPlugin } from "authula/plugins";

const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new AdminPlugin()],
});
```

#### User Management

```typescript
await authulaClient.admin.createUser({
  name: "John Doe",
  email: "user@example.com",
  // other fields...
});

// Get all users with pagination
const users = await authulaClient.admin.getAllUsers(100);

// Get a specific user by ID
const user = await authulaClient.admin.getUserById("user-id");

// Update user information
await authulaClient.admin.updateUser("user-id", { name: "Jane" });

// Delete a user
await authulaClient.admin.deleteUser("user-id");
```

#### Account Management

```typescript
// Create a new account for a user
await authulaClient.admin.createAccount("user-id", { /* account data */ });

// Get all accounts for a user
await authulaClient.admin.getUserAccounts("user-id");

// Get a specific account by ID
await authulaClient.admin.getAccountById("account-id");

// Update account information
await authulaClient.admin.updateAccount("account-id", { /* data */ });

// Delete an account
await authulaClient.admin.deleteAccount("account-id");
```

#### User State Management

```typescript
// Get user state
await authulaClient.admin.getUserState("user-id");

// Create or update user state
await authulaClient.admin.createUserState("user-id", { /* state data */ });

// Update user state
await authulaClient.admin.updateUserState("user-id", { /* state data */ });

// Delete user state
await authulaClient.admin.deleteUserState("user-id");

// Get all banned user states
await authulaClient.admin.getBannedUserStates();

// Ban a user
await authulaClient.admin.banUser("user-id", { reason: "reason..." });

// Unban a user
await authulaClient.admin.unbanUser("user-id");

// Get all active sessions for a user
await authulaClient.admin.getUserAdminSessions("user-id");
```

#### Session State Management

```typescript
// Get session state
await authulaClient.admin.getSessionState("session-id");

// Create or update session state
await authulaClient.admin.createSessionState("session-id", { /* data */ });

// Update session state
await authulaClient.admin.updateSessionState("session-id", { /* data */ });

// Delete session state
await authulaClient.admin.deleteSessionState("session-id");

// Get all revoked session states
await authulaClient.admin.getRevokedSessionStates();

// Revoke a session
await authulaClient.admin.revokeSession("session-id", { reason: "reason..." });
```

#### Impersonations

```typescript
// Get all active impersonations
await authulaClient.admin.getAllImpersonations();

// Get a specific impersonation by ID
await authulaClient.admin.getImpersonationById("impersonation-id");

// Start impersonating a user
await authulaClient.admin.startImpersonation({ user_id: "user-id", /* data */ });

// Stop impersonation
await authulaClient.admin.stopImpersonation("impersonation-id");
```

---

### Email Password Plugin

Handles traditional email/password authentication flows.

```typescript
import { EmailPasswordPlugin } from "authula/plugins";

const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new EmailPasswordPlugin()],
});

// Sign up
await authulaClient.emailPassword.signUp({
  name: "John Doe",
  email: "john@example.com",
  password: "securePassword123",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Sign in
const response = await authulaClient.emailPassword.signIn({
  email: "john@example.com",
  password: "securePassword123",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Send email verification
await authulaClient.emailPassword.sendEmailVerification({
  email: "john@example.com",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Request password reset
await authulaClient.emailPassword.requestPasswordReset({
  email: "john@example.com",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Change password
await authulaClient.emailPassword.changePassword({
  token: "reset-token",
  password: "newSecurePassword123",
});

// Request email change
await authulaClient.emailPassword.requestEmailChange({
  email: "john.doe@example.com",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});
```

---

### OAuth2 Plugin

Handles OAuth2 authentication with popular providers.

```typescript
import { OAuth2Plugin } from "authula/plugins";

const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new OAuth2Plugin()],
});

// Redirect user to OAuth2 provider
const response = await authulaClient.oauth2.signIn({
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
import { CSRFPlugin } from "authula/plugins";

const authulaClient = createClient({
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
import { JWTPlugin } from "authula/plugins";

const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new JWTPlugin()],
});

// Refresh JWT tokens
const tokens = await authulaClient.jwt.refreshToken({
  refresh_token: "your-refresh-token",
});

// Get JWKS keys
const jwksKeys = await authulaClient.jwt.getJWKSKeys();
```

---

### Bearer Plugin

Provides automatic bearer token handling and refresh.

```typescript
import { BearerPlugin, JWTPlugin } from "authula/plugins";

const authulaClient = createClient({
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
import { MagicLinkPlugin } from "authula/plugins";

const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new MagicLinkPlugin()],
});

// Send magic link via email
await authulaClient.magicLink.signIn({
  email: "john.doe@example.com",
  name: "John Doe", // Optional name
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Verify magic link token
await authulaClient.magicLink.verify({
  token: "magic-link-token",
  callbackUrl: "http://localhost:3000/callback", // Optional callback URL
});

// Exchange token from verify endpoint for session
await authulaClient.magicLink.exchange({
  token: "magic-link-token",
});
```

---

### TOTP Plugin

Provides time-based one-time password (TOTP) two-factor authentication flows.

```typescript
import { TOTPPlugin } from "authula/plugins";

const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new TOTPPlugin()],
});

// Enable TOTP for the current user
await authulaClient.totp.enable();

// Disable TOTP for the current user
await authulaClient.totp.disable();

// Get the TOTP URI for QR code generation
await authulaClient.totp.getUri();

// Verify a TOTP code
await authulaClient.totp.verify({
  code: "123456",
  trustDevice: true,
});

// Verify a backup code
await authulaClient.totp.verifyBackupCode({
  code: "AbcXyz",
  trustDevice: true,
});

// Generate fresh backup codes
await authulaClient.totp.generateBackupCodes();
```

---

## Advanced Configuration

### Fetch Options

Configure fetch behavior with timeout and other options:

```typescript
const authulaClient = createClient({
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
const authulaClient = createClient({
  url: "http://localhost:8080/auth",
  plugins: [new EmailPasswordPlugin()],
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

## API Reference

### Client Configuration

```typescript
{
  // Base URL of your Authula server
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
  const response = await authulaClient.emailPassword.signIn({
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

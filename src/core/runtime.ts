import type { AuthulaClient } from "./client";

const DEFAULT_CLIENT = Symbol.for("authula.default-client");

type RuntimeStore = {
  client?: AuthulaClient;
};

const globalStore = globalThis as unknown as Record<symbol, RuntimeStore | undefined>;
const store = (globalStore[DEFAULT_CLIENT] ??= {});

export function setDefaultClient(client: AuthulaClient | undefined): void {
  store.client = client;
}

export function getDefaultClient(): AuthulaClient | undefined {
  return store.client;
}

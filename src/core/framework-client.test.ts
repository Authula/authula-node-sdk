import { describe, expect, test, vi } from "vitest";

import type { AuthulaClient } from "./client";
import { attachFrameworkHooks, wrapHook } from "./framework-client";
import type { Plugin } from "./types";

const testApiUrl = "http://localhost:8080/api/auth";

function createMockClient(): AuthulaClient {
  return {
    config: {
      url: testApiUrl,
    },
    runBeforeFetch: vi.fn(),
    runAfterFetch: vi.fn(),
  } as unknown as AuthulaClient;
}

describe("wrapHook", () => {
  test("injects request context into mutation hook options", () => {
    const client = createMockClient();
    const hook = vi.fn((options?: { mutation?: any; request?: any }, _qc?: any) => options);
    const wrapped = wrapHook(hook, client);

    wrapped({ mutation: { mutationKey: ["key"] } });

    expect(hook).toHaveBeenCalledWith({
      mutation: { mutationKey: ["key"] },
      request: {
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      },
    });
  });

  test("appends options when a mutation hook is called without arguments", () => {
    const client = createMockClient();
    const hook = vi.fn((options?: any, _qc?: any) => options);
    const wrapped = wrapHook(hook, client);

    wrapped();

    expect(hook).toHaveBeenCalledWith({
      request: {
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      },
    });
  });

  test("injects into query hook options at length-2 with two data params", () => {
    const client = createMockClient();
    const hook = vi.fn((_orgId: string, _invId: string, options?: any, _qc?: any) => options);
    expect(hook.length).toBe(4);
    const wrapped = wrapHook(hook, client);

    wrapped("org-123", "inv-456", { query: { enabled: true } });

    expect(hook).toHaveBeenCalledWith("org-123", "inv-456", {
      query: { enabled: true },
      request: {
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      },
    });
  });

  test("injects into query hook options at length-2 with one data param", () => {
    const client = createMockClient();
    const hook = vi.fn((_orgId: string, options?: any, _qc?: any) => options);
    expect(hook.length).toBe(3);
    const wrapped = wrapHook(hook, client);

    wrapped("org-123", { query: { page: 1 } });

    expect(hook).toHaveBeenCalledWith("org-123", {
      query: { page: 1 },
      request: {
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      },
    });
  });

  test("appends query options when called without options", () => {
    const client = createMockClient();
    const hook = vi.fn((_a: string, _b: string, options?: any, _qc?: any) => options);
    const wrapped = wrapHook(hook, client);

    wrapped("org-123", "inv-456");

    expect(hook).toHaveBeenCalledWith("org-123", "inv-456", {
      request: {
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      },
    });
  });

  test("falls back to the last parameter when length-2 is a primitive", () => {
    const client = createMockClient();
    const hook = vi.fn((_a: string, _b: string, _c: string, options?: any) => options);
    expect(hook.length).toBe(4);
    const wrapped = wrapHook(hook, client);

    wrapped("org-123", "inv-456", "user-789", { request: { headers: {} } });

    expect(hook).toHaveBeenCalledWith("org-123", "inv-456", "user-789", {
      request: {
        headers: {},
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      },
    });
  });

  test("explicit request values override client defaults", () => {
    const client = createMockClient();
    const cookies = vi.fn();
    const hook = vi.fn((options?: any, _qc?: any) => options);
    const wrapped = wrapHook(hook, client);

    wrapped({
      request: {
        baseUrl: "https://override.test/api",
        cookies,
        headers: { "X-Custom": "value" },
      },
    });

    const request = hook.mock.calls[0][0].request;
    expect(request.baseUrl).toBe("https://override.test/api");
    expect(request.cookies).toBe(cookies);
    expect(request.headers).toEqual({ "X-Custom": "value" });
    expect(request.onBeforeFetch).toEqual(expect.any(Function));
    expect(request.onAfterFetch).toEqual(expect.any(Function));
  });

  test("trims trailing slash from the client base URL", () => {
    const client = {
      config: { url: `${testApiUrl}/` },
      runBeforeFetch: vi.fn(),
      runAfterFetch: vi.fn(),
    } as unknown as AuthulaClient;
    const hook = vi.fn((options?: any) => options);
    const wrapped = wrapHook(hook, client);

    wrapped();

    expect(hook.mock.calls[0][0].request.baseUrl).toBe(testApiUrl);
  });

  test("delegates onBeforeFetch and onAfterFetch to the client", async () => {
    const client = createMockClient();
    const hook = vi.fn((options?: any) => options);
    const wrapped = wrapHook(hook, client);

    wrapped();
    const request = hook.mock.calls[0][0].request;
    const ctx = { url: "/test", init: {}, meta: {} };
    const res = new Response();

    await request.onBeforeFetch(ctx);
    await request.onAfterFetch(ctx, res);

    expect(client.runBeforeFetch).toHaveBeenCalledWith(ctx);
    expect(client.runAfterFetch).toHaveBeenCalledWith(ctx, res);
  });
});

describe("attachFrameworkHooks", () => {
  function createPlugin(id: string): Plugin {
    return { id, init: () => undefined };
  }

  function createClientWithApi(api: Record<string, unknown>): AuthulaClient {
    return {
      ...createMockClient(),
      core: api,
    } as unknown as AuthulaClient;
  }

  test("attaches matching hooks to the plugin API", () => {
    const client = createClientWithApi({
      getMe: vi.fn(),
      signOut: vi.fn(),
      constant: "value",
    });
    const generated = {
      useGetMe: vi.fn((options?: any) => options),
      useSignOut: vi.fn((options?: any) => options),
      useUnrelated: vi.fn(),
    };

    attachFrameworkHooks(client, [createPlugin("core")], generated, "use");

    const api = (client as any).core;
    expect(typeof api.useGetMe).toBe("function");
    expect(typeof api.useSignOut).toBe("function");
    expect(api.useUnrelated).toBeUndefined();
    expect(api.constant).toBe("value");
    expect(typeof api.getMe).toBe("function");
  });

  test("uses the create prefix for Svelte-style hooks", () => {
    const client = createClientWithApi({ getMe: vi.fn() });
    const generated = {
      createGetMe: vi.fn((options?: any) => options),
      useGetMe: vi.fn(),
    };

    attachFrameworkHooks(client, [createPlugin("core")], generated, "create");

    const api = (client as any).core;
    expect(typeof api.createGetMe).toBe("function");
    expect(api.useGetMe).toBeUndefined();
  });

  test("wrapped client hooks inject client request context", () => {
    const client = createClientWithApi({ getMe: vi.fn() });
    const hook = vi.fn((options?: any) => options);
    const generated = { useGetMe: hook };

    attachFrameworkHooks(client, [createPlugin("core")], generated, "use");

    const result = (client as any).core.useGetMe({ query: { enabled: true } });
    expect(result.query).toEqual({ enabled: true });
    expect(result.request.baseUrl).toBe(testApiUrl);
  });

  test("skips plugins whose init returns no API object", () => {
    const client = createMockClient();

    expect(() =>
      attachFrameworkHooks(client, [createPlugin("bearer")], { useGetMe: vi.fn() }, "use"),
    ).not.toThrow();
  });
});

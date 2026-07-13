import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { CSRFPlugin } from "./plugin";
import type { BeforeFetchHook, FetchContext } from "@/types";
import type { AuthulaClient } from "@/client";

type MockClient = {
  registerBeforeFetch: (hook: BeforeFetchHook) => void;
  getCookie: ReturnType<typeof vi.fn>;
  getAllCookies: ReturnType<typeof vi.fn>;
};

describe("CSRF Plugin", () => {
  let plugin: CSRFPlugin;
  let mockClient: MockClient;
  let beforeFetchHooks: Array<BeforeFetchHook>;

  const defaultOptions = {
    cookieName: "csrf_token",
    headerName: "X-CSRF-TOKEN",
  };

  beforeEach(() => {
    plugin = new CSRFPlugin(defaultOptions);
    beforeFetchHooks = [];

    mockClient = {
      registerBeforeFetch: vi.fn((hook) => beforeFetchHooks.push(hook)),
      getCookie: vi.fn(),
      getAllCookies: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Plugin initialization", () => {
    test("should have correct id", () => {
      expect(plugin.id).toBe("csrf");
    });

    test("should accept options with custom names", () => {
      const customPlugin = new CSRFPlugin({
        cookieName: "csrf_token",
        headerName: "X-CSRF-TOKEN",
      });
      expect(customPlugin).toBeDefined();
    });

    test("should register beforeFetch hook on init", () => {
      plugin.init(mockClient as unknown as AuthulaClient);
      expect(mockClient.registerBeforeFetch).toHaveBeenCalledTimes(1);
    });

    test("should return empty object from init", () => {
      const result = plugin.init(mockClient as unknown as AuthulaClient);
      expect(result).toEqual({});
    });
  });

  describe("beforeFetch hook - method filtering", () => {
    test.each(["GET", "HEAD", "OPTIONS"])(
      "should skip %s requests",
      async (method) => {
        plugin.init(mockClient as unknown as AuthulaClient);
        const ctx: FetchContext = {
          url: "/test",
          init: { method },
          meta: {},
        };

        await beforeFetchHooks[0](ctx);
        expect(ctx.init.headers).toBeUndefined();
      },
    );

    test("should process POST requests", async () => {
      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
        cookies: { csrf_token: "test-token" },
      };

      await beforeFetchHooks[0](ctx);
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("X-CSRF-TOKEN")).toBe("test-token");
    });
  });

  describe("beforeFetch hook - SSR via ctx.cookies", () => {
    test("should read CSRF token from ctx.cookies when available", async () => {
      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
        cookies: { csrf_token: "ssr-csrf-value" },
      };

      await beforeFetchHooks[0](ctx);
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("X-CSRF-TOKEN")).toBe("ssr-csrf-value");
    });

    test("should not fall back to client.getCookie when ctx.cookies has the value", async () => {
      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
        cookies: { csrf_token: "ssr-csrf-value" },
      };

      await beforeFetchHooks[0](ctx);
      expect(mockClient.getCookie).not.toHaveBeenCalled();
    });

    test("should fall back to client.getCookie when ctx.cookies is available but cookie name not found", async () => {
      vi.mocked(mockClient.getCookie).mockResolvedValue("fallback-value");

      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
        cookies: { other_cookie: "some-value" },
      };

      await beforeFetchHooks[0](ctx);
      expect(mockClient.getCookie).toHaveBeenCalledWith("csrf_token");
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("X-CSRF-TOKEN")).toBe("fallback-value");
    });
  });

  describe("beforeFetch hook - SSR via client.getCookie fallback", () => {
    test("should use client.getCookie when ctx.cookies is undefined", async () => {
      vi.mocked(mockClient.getCookie).mockResolvedValue("token-from-client");

      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
      };

      await beforeFetchHooks[0](ctx);
      expect(mockClient.getCookie).toHaveBeenCalledWith("csrf_token");
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("X-CSRF-TOKEN")).toBe("token-from-client");
    });
  });

  describe("beforeFetch hook - Browser via document.cookie", () => {
    beforeEach(() => {
      Object.defineProperty(global, "document", {
        value: { cookie: "csrf_token=browser-csrf-value; other=val" },
        writable: true,
        configurable: true,
      });
    });

    test("should read CSRF token from document.cookie via client.getCookie", async () => {
      vi.mocked(mockClient.getCookie).mockImplementation(async (name) => {
        if (typeof document === "undefined") {
          return undefined;
        }
        const { parseCookie } = await import("cookie");
        return parseCookie(document.cookie)[name];
      });

      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
      };

      await beforeFetchHooks[0](ctx);
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("X-CSRF-TOKEN")).toBe("browser-csrf-value");
    });
  });

  describe("beforeFetch hook - missing cookie", () => {
    test("should skip when ctx.cookies exists but no matching cookie", async () => {
      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
        cookies: { other_cookie: "value" },
      };

      vi.mocked(mockClient.getCookie).mockResolvedValue(undefined);

      await beforeFetchHooks[0](ctx);
      expect(mockClient.getCookie).toHaveBeenCalledWith("csrf_token");
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("X-CSRF-TOKEN")).toBeNull();
    });

    test("should skip when no cookies available at all", async () => {
      vi.mocked(mockClient.getCookie).mockResolvedValue(undefined);

      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
      };

      await beforeFetchHooks[0](ctx);
      expect(mockClient.getCookie).toHaveBeenCalledWith("csrf_token");
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("X-CSRF-TOKEN")).toBeNull();
    });
  });

  describe("beforeFetch hook - header handling", () => {
    test("should use configured header name", async () => {
      const customPlugin = new CSRFPlugin({
        cookieName: "some_csrf_token",
        headerName: "X-SOME-CSRF-TOKEN",
      });

      customPlugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
        cookies: { some_csrf_token: "custom-header-value" },
      };

      await beforeFetchHooks[0](ctx);
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("X-SOME-CSRF-TOKEN")).toBe("custom-header-value");
      expect(headers.get("X-CSRF-TOKEN")).toBeNull();
    });

    test("should preserve existing headers when setting CSRF header", async () => {
      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
        meta: {},
        cookies: { csrf_token: "token-value" },
      };

      await beforeFetchHooks[0](ctx);
      const headers = new Headers(ctx.init.headers);
      expect(headers.get("Content-Type")).toBe("application/json");
      expect(headers.get("X-CSRF-TOKEN")).toBe("token-value");
    });

    test("should convert plain headers object to Headers instance", async () => {
      plugin.init(mockClient as unknown as AuthulaClient);
      const ctx: FetchContext = {
        url: "/test",
        init: { method: "POST", headers: {} },
        meta: {},
        cookies: { csrf_token: "token-value" },
      };

      await beforeFetchHooks[0](ctx);
      expect(ctx.init.headers).toBeInstanceOf(Headers);
    });
  });
});

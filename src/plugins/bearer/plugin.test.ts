import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { BearerPlugin } from "./plugin";
import type { AfterFetchHook, BeforeFetchHook, FetchContext } from "@/types";
import type { JWTPlugin } from "../jwt/plugin";
import type { ClientWithPlugins } from "@/sdk";
import { localStorageMock } from "@/tests/mocks/local-storage.mock";

describe("Bearer Plugin", () => {
  let plugin: BearerPlugin;
  let mockClient: Partial<ClientWithPlugins<[JWTPlugin]>>;
  let beforeFetchHooks: Array<BeforeFetchHook>;
  let afterFetchHooks: Array<AfterFetchHook>;

  beforeEach(() => {
    plugin = new BearerPlugin();
    beforeFetchHooks = [];
    afterFetchHooks = [];

    mockClient = {
      registerBeforeFetch: vi.fn((hook) => beforeFetchHooks.push(hook)),
      registerAfterFetch: vi.fn((hook) => afterFetchHooks.push(hook)),
      jwt: {
        refreshToken: vi.fn(),
        getJWKS: vi.fn(),
      } as unknown as any,
    };

    // Mock localStorage
    Object.defineProperty(global, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Mock document
    Object.defineProperty(global, "document", {
      value: {},
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Plugin initialization", () => {
    test("should have correct id", () => {
      expect(plugin.id).toBe("bearer");
    });

    test("should accept options with custom headerName", () => {
      const customPlugin = new BearerPlugin({ headerName: "X-Custom-Auth" });
      expect(customPlugin).toBeDefined();
    });

    test("should register beforeFetch and afterFetch hooks on init", () => {
      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      expect(mockClient.registerBeforeFetch).toHaveBeenCalledTimes(1);
      expect(mockClient.registerAfterFetch).toHaveBeenCalledTimes(1);
    });

    test("should return empty object from init", () => {
      const result = plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      expect(result).toEqual({});
    });
  });

  describe("beforeFetch hook", () => {
    test("should skip if document is undefined (SSR environment)", async () => {
      Object.defineProperty(global, "document", {
        value: undefined,
        writable: true,
      });

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };

      await beforeFetchHooks[0](ctx);
      expect(ctx.init.headers).toEqual({});
    });

    test("should add Authorization header with Bearer token from localStorage", async () => {
      const mockToken = "test-access-token";
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "accessToken") return mockToken;
        return null;
      });

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };

      await beforeFetchHooks[0](ctx);
      expect(ctx.init.headers).toEqual({
        Authorization: "Bearer test-access-token",
      });
    });

    test("should use custom headerName from options", async () => {
      const customPlugin = new BearerPlugin({ headerName: "X-Custom-Auth" });
      const mockToken = "test-access-token";
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "accessToken") return mockToken;
        return null;
      });

      customPlugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };

      await beforeFetchHooks[0](ctx);
      expect(ctx.init.headers).toEqual({
        "X-Custom-Auth": "Bearer test-access-token",
      });
    });

    test("should preserve existing headers when adding Authorization", async () => {
      const mockToken = "test-access-token";
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "accessToken") return mockToken;
        return null;
      });

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: { "Content-Type": "application/json" } },
        meta: {},
      };

      await beforeFetchHooks[0](ctx);
      expect(ctx.init.headers).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer test-access-token",
      });
    });

    test("should not add header if no accessToken in localStorage", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };

      await beforeFetchHooks[0](ctx);
      expect(ctx.init.headers).toEqual({});
      expect(localStorage.getItem).toHaveBeenCalledWith("accessToken");
    });
  });

  describe("afterFetch hook", () => {
    test("should skip if document is undefined (SSR environment)", async () => {
      Object.defineProperty(global, "document", {
        value: undefined,
        writable: true,
      });

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      const result = await afterFetchHooks[0](ctx, mockResponse);
      expect(result).toBeUndefined();
    });

    test("should skip if response status is not 401", async () => {
      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 200 });

      const result = await afterFetchHooks[0](ctx, mockResponse);
      expect(result).toBeUndefined();
    });

    test("should skip if ctx.meta.retry is true", async () => {
      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: { retry: true },
      };
      const mockResponse = new Response(null, { status: 401 });

      const result = await afterFetchHooks[0](ctx, mockResponse);
      expect(result).toBeUndefined();
    });

    test("should skip if no refreshToken in localStorage", async () => {
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return null;
        return null;
      });

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      const result = await afterFetchHooks[0](ctx, mockResponse);
      expect(result).toBeUndefined();
      expect(localStorage.getItem).toHaveBeenCalledWith("refreshToken");
    });

    test("should warn and skip if JWT plugin is not available", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "test-refresh-token";
        return null;
      });

      const clientWithoutJwt = {
        registerBeforeFetch: vi.fn((hook) => beforeFetchHooks.push(hook)),
        registerAfterFetch: vi.fn((hook) => afterFetchHooks.push(hook)),
        jwt: undefined,
      };

      plugin.init(
        clientWithoutJwt as unknown as ClientWithPlugins<[JWTPlugin]>,
      );
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      const result = await afterFetchHooks[0](ctx, mockResponse);
      expect(result).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        "JWT Plugin is required for Bearer token refresh.",
      );
    });

    test("should refresh token and update localStorage on 401", async () => {
      const newAccessToken = "new-access-token";
      const newRefreshToken = "new-refresh-token";
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "old-refresh-token";
        return null;
      });
      vi.mocked(mockClient.jwt!.refreshToken).mockResolvedValue({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      const result = await afterFetchHooks[0](ctx, mockResponse);
      expect(result).toBe("retry");
      expect(mockClient.jwt!.refreshToken).toHaveBeenCalledWith({
        refreshToken: "old-refresh-token",
      });
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "accessToken",
        newAccessToken,
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "refreshToken",
        newRefreshToken,
      );
      expect(ctx.init.headers).toEqual({
        Authorization: `Bearer ${newAccessToken}`,
      });
    });

    test("should use custom headerName in retry request", async () => {
      const customPlugin = new BearerPlugin({ headerName: "X-Custom-Auth" });
      const newAccessToken = "new-access-token";
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "old-refresh-token";
        return null;
      });
      vi.mocked(mockClient.jwt!.refreshToken).mockResolvedValue({
        accessToken: newAccessToken,
        refreshToken: "new-refresh-token",
      });

      customPlugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      await afterFetchHooks[0](ctx, mockResponse);
      expect(ctx.init.headers).toEqual({
        "X-Custom-Auth": `Bearer ${newAccessToken}`,
      });
    });

    test("should not retry if refresh fails", async () => {
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "old-refresh-token";
        return null;
      });
      vi.mocked(mockClient.jwt!.refreshToken).mockResolvedValue(null as any);

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      const result = await afterFetchHooks[0](ctx, mockResponse);
      expect(result).toBeUndefined();
    });

    test("should propagate refresh errors (no try/catch in plugin)", async () => {
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "old-refresh-token";
        return null;
      });
      vi.mocked(mockClient.jwt!.refreshToken).mockRejectedValue(
        new Error("Network error"),
      );

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      // Plugin doesn't catch errors, they propagate
      await expect(afterFetchHooks[0](ctx, mockResponse)).rejects.toThrow(
        "Network error",
      );
    });

    test("should implement single flight pattern for concurrent 401s", async () => {
      const newAccessToken = "new-access-token";
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "old-refresh-token";
        return null;
      });

      // Slow refresh to test single flight
      let resolveRefresh: (value: {
        accessToken: string;
        refreshToken: string;
      }) => void;
      const refreshPromise = new Promise<{
        accessToken: string;
        refreshToken: string;
      }>((resolve) => {
        resolveRefresh = resolve;
      });
      vi.mocked(mockClient.jwt!.refreshToken).mockReturnValue(refreshPromise);

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);

      const ctx1: FetchContext = {
        url: "/test1",
        init: { headers: {} },
        meta: {},
      };
      const ctx2: FetchContext = {
        url: "/test2",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      // Start both requests concurrently
      const promise1 = afterFetchHooks[0](ctx1, mockResponse);
      const promise2 = afterFetchHooks[0](ctx2, mockResponse);

      // Resolve the refresh
      resolveRefresh!({
        accessToken: newAccessToken,
        refreshToken: "new-refresh-token",
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both should retry
      expect(result1).toBe("retry");
      expect(result2).toBe("retry");

      // But refresh should only be called once (single flight)
      expect(mockClient.jwt!.refreshToken).toHaveBeenCalledTimes(1);
    });

    test("should clear refreshPromise after successful refresh", async () => {
      const newAccessToken = "new-access-token";
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "old-refresh-token";
        return null;
      });
      vi.mocked(mockClient.jwt!.refreshToken).mockResolvedValue({
        accessToken: newAccessToken,
        refreshToken: "new-refresh-token",
      });

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      await afterFetchHooks[0](ctx, mockResponse);

      // Second 401 should trigger a new refresh
      vi.mocked(mockClient.jwt!.refreshToken).mockClear();
      const ctx2: FetchContext = {
        url: "/test2",
        init: { headers: {} },
        meta: {},
      };
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "new-refresh-token";
        return null;
      });

      await afterFetchHooks[0](ctx2, mockResponse);
      expect(mockClient.jwt!.refreshToken).toHaveBeenCalledTimes(1);
    });

    test("should clear refreshPromise and allow retry after failed refresh", async () => {
      // First request fails
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === "refreshToken") return "old-refresh-token";
        return null;
      });
      vi.mocked(mockClient.jwt!.refreshToken).mockRejectedValueOnce(
        new Error("Refresh failed"),
      );

      plugin.init(mockClient as ClientWithPlugins<[JWTPlugin]>);
      const ctx: FetchContext = {
        url: "/test",
        init: { headers: {} },
        meta: {},
      };
      const mockResponse = new Response(null, { status: 401 });

      // First attempt throws
      await expect(afterFetchHooks[0](ctx, mockResponse)).rejects.toThrow(
        "Refresh failed",
      );

      // After failed refresh (finally clears the promise), a new 401 should attempt refresh again
      vi.mocked(mockClient.jwt!.refreshToken).mockResolvedValueOnce({
        accessToken: "new-token",
        refreshToken: "new-refresh",
      });

      const ctx2: FetchContext = {
        url: "/test2",
        init: { headers: {} },
        meta: {},
      };

      const result = await afterFetchHooks[0](ctx2, mockResponse);
      expect(result).toBe("retry");
      expect(mockClient.jwt!.refreshToken).toHaveBeenCalledTimes(2);
    });
  });
});

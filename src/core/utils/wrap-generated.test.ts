import { wrapGenerated } from "./wrap-generated";
import type { AuthulaClient } from "../client";

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

describe("wrapGenerated", () => {
  describe("non-hook functions", () => {
    test("injects context into the last parameter", () => {
      const client = createMockClient();
      const fn = vi.fn((a: string, b: string, options?: any) => options);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc("a", "b", { custom: true });

      expect(fn).toHaveBeenCalledWith("a", "b", {
        custom: true,
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      });
    });

    test("appends context when options argument is omitted", () => {
      const client = createMockClient();
      const fn = vi.fn((a: string, options?: any) => options);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc("a");

      expect(fn).toHaveBeenCalledWith("a", {
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      });
    });

    test("merges with existing options", () => {
      const client = createMockClient();
      const fn = vi.fn((options?: any) => options);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc({ signal: new AbortController().signal });

      expect(fn).toHaveBeenCalledWith({
        signal: expect.any(AbortSignal),
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      });
    });

    test("does not inject context for functions with no declared params", () => {
      const client = createMockClient();
      const fn = vi.fn(() => "done");
      expect(fn.length).toBe(0);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      const result = wrapped.myFunc();

      expect(result).toBe("done");
      expect(fn).toHaveBeenCalledWith();
    });

    test("handles functions with only options param", () => {
      const client = createMockClient();
      const fn = vi.fn((options?: any) => options);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc();

      expect(fn).toHaveBeenCalledWith({
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      });
    });

    test("preserves non-options params in order", () => {
      const client = createMockClient();
      const fn = vi.fn((a: string, b: string, options?: any) => [a, b, options]);
      expect(fn.length).toBe(3);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc("org-123", "inv-456", { signal: null });

      expect(fn.mock.calls[0][0]).toBe("org-123");
      expect(fn.mock.calls[0][1]).toBe("inv-456");
      expect(fn.mock.calls[0][2]).toMatchObject({
        signal: null,
        baseUrl: expect.any(String),
      });
    });

    test("passes through non-function values", () => {
      const client = createMockClient();
      const mod = { CONSTANT: "hello", someType: { foo: "bar" } };
      const wrapped = wrapGenerated(mod, client);

      expect(wrapped.CONSTANT).toBe("hello");
      expect(wrapped.someType).toEqual({ foo: "bar" });
    });

    test("trims trailing slash from baseUrl", () => {
      const client = {
        config: { url: testApiUrl + "/" },
        runBeforeFetch: vi.fn(),
        runAfterFetch: vi.fn(),
      } as unknown as AuthulaClient;
      const fn = vi.fn((options?: any) => options);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc();

      expect(fn).toHaveBeenCalledWith({
        baseUrl: testApiUrl,
        cookies: undefined,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      });
    });

    test("passes cookies from client config", () => {
      const cookieFn = vi.fn();
      const client = {
        config: { url: testApiUrl, cookies: cookieFn },
        runBeforeFetch: vi.fn(),
        runAfterFetch: vi.fn(),
      } as unknown as AuthulaClient;
      const fn = vi.fn((options?: any) => options);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc();

      expect(fn).toHaveBeenCalledWith({
        baseUrl: testApiUrl,
        cookies: cookieFn,
        onBeforeFetch: expect.any(Function),
        onAfterFetch: expect.any(Function),
      });
    });

    test("onBeforeFetch delegates to client.runBeforeFetch", async () => {
      const client = createMockClient();
      const fn = vi.fn((options?: any) => options);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc();
      const ctx = { url: "/test", init: {}, meta: {} };
      const callArg = fn.mock.calls[0][0];
      await callArg.onBeforeFetch(ctx);

      expect(client.runBeforeFetch).toHaveBeenCalledWith(ctx);
    });

    test("onAfterFetch delegates to client.runAfterFetch", async () => {
      const client = createMockClient();
      const fn = vi.fn((options?: any) => options);
      const mod = { myFunc: fn };
      const wrapped = wrapGenerated(mod, client);

      wrapped.myFunc();
      const ctx = { url: "/test", init: {}, meta: {} };
      const res = new Response();
      const callArg = fn.mock.calls[0][0];
      await callArg.onAfterFetch(ctx, res);

      expect(client.runAfterFetch).toHaveBeenCalledWith(ctx, res);
    });
  });
});

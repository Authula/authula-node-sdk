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
      const fn = vi.fn((a: string, b: string, options?: any) => [
        a,
        b,
        options,
      ]);
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

  describe("hook functions (useXyz)", () => {
    describe("mutation hooks (options first, queryClient last)", () => {
      test("injects context into the options argument (index 0 when length is 2)", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (options?: { mutation?: any; request?: any }, _qc?: any) => options,
        );
        expect(hook.length).toBe(2);
        const mod = { useMutation: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useMutation({ mutation: { mutationKey: ["key"] } });

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

      test("appends options when mutation hook called without arguments", () => {
        const client = createMockClient();
        const hook = vi.fn((options?: { request?: any }, _qc?: any) => options);
        expect(hook.length).toBe(2);
        const mod = { useMutation: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useMutation();

        expect(hook).toHaveBeenCalledWith({
          request: {
            baseUrl: testApiUrl,
            cookies: undefined,
            onBeforeFetch: expect.any(Function),
            onAfterFetch: expect.any(Function),
          },
        });
      });

      test("preserves existing request properties in mutation hooks", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (options?: { request?: any; mutation?: any }, _qc?: any) => options,
        );
        const mod = { useMutation: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useMutation({
          mutation: { mutationKey: ["key"] },
          request: { headers: { Authorization: "Bearer x" } },
        });

        expect(hook).toHaveBeenCalledWith({
          mutation: { mutationKey: ["key"] },
          request: {
            headers: { Authorization: "Bearer x" },
            baseUrl: testApiUrl,
            cookies: undefined,
            onBeforeFetch: expect.any(Function),
            onAfterFetch: expect.any(Function),
          },
        });
      });
    });

    describe("query hooks (data params, options, queryClient)", () => {
      test("injects into options at index length-2 (2 data params, length 4)", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (
            _orgId: string,
            _invId: string,
            options?: { query?: any; request?: any },
            _qc?: any,
          ) => options,
        );
        expect(hook.length).toBe(4);
        const mod = { useGetInvitation: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useGetInvitation("org-123", "inv-456", {
          query: { enabled: true },
        });

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

      test("works with 1 data param, options, queryClient (length 3)", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (
            _orgId: string,
            options?: { query?: any; request?: any },
            _qc?: any,
          ) => options,
        );
        expect(hook.length).toBe(3);
        const mod = { useListInvitations: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useListInvitations("org-123", { query: { page: 1 } });

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

      test("works with 3 data params, options, queryClient (length 5)", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (
            _a: string,
            _b: string,
            _c: string,
            options?: { request?: any },
            _qc?: any,
          ) => options,
        );
        expect(hook.length).toBe(5);
        const mod = { useDeep: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useDeep("x", "y", "z", { request: { headers: {} } });

        expect(hook).toHaveBeenCalledWith("x", "y", "z", {
          request: {
            headers: {},
            baseUrl: testApiUrl,
            cookies: undefined,
            onBeforeFetch: expect.any(Function),
            onAfterFetch: expect.any(Function),
          },
        });
      });

      test("appends options when query hook called without options", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (
            _orgId: string,
            _invId: string,
            options?: { request?: any },
            _qc?: any,
          ) => options,
        );
        const mod = { useGetInvitation: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useGetInvitation("org-123", "inv-456");

        expect(hook).toHaveBeenCalledWith("org-123", "inv-456", {
          request: {
            baseUrl: testApiUrl,
            cookies: undefined,
            onBeforeFetch: expect.any(Function),
            onAfterFetch: expect.any(Function),
          },
        });
      });

      test("preserves existing request properties in query hooks", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (
            _orgId: string,
            _invId: string,
            options?: { query?: any; request?: any },
            _qc?: any,
          ) => options,
        );
        const mod = { useGetInvitation: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useGetInvitation("org-123", "inv-456", {
          query: { enabled: true },
          request: { headers: { "X-Custom": "val" } },
        });

        expect(hook).toHaveBeenCalledWith("org-123", "inv-456", {
          query: { enabled: true },
          request: {
            headers: { "X-Custom": "val" },
            baseUrl: testApiUrl,
            cookies: undefined,
            onBeforeFetch: expect.any(Function),
            onAfterFetch: expect.any(Function),
          },
        });
      });
    });

    describe("fallback: no queryClient parameter", () => {
      test("falls back to length-1 when arg at length-2 is a primitive", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (_a: string, _b: string, _c: string, options?: { request?: any }) =>
            options,
        );
        expect(hook.length).toBe(4);
        const mod = { useXyz: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useXyz("org-123", "inv-456", "user-789", {
          request: { headers: {} },
        });

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

      test("still uses length-2 when arg at length-2 is an object", () => {
        const client = createMockClient();
        const hook = vi.fn(
          (_a: string, options?: { request?: any }) => options,
        );
        expect(hook.length).toBe(2);
        const mod = { useXyz: hook };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useXyz("org-123", { request: { headers: {} } });

        expect(hook).toHaveBeenCalledWith("org-123", {
          request: {
            headers: {},
            baseUrl: testApiUrl,
            cookies: undefined,
            onBeforeFetch: expect.any(Function),
            onAfterFetch: expect.any(Function),
          },
        });
      });
    });

    describe("non-hook-like function names", () => {
      test("does not treat functions starting with 'use' which are not followed by uppercase as hooks", () => {
        const client = createMockClient();
        const fn = vi.fn((a: string, options?: any) => options);
        const mod = { useful: fn };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useful("hello", { custom: true });

        expect(fn).toHaveBeenCalledWith("hello", {
          custom: true,
          baseUrl: testApiUrl,
          cookies: undefined,
          onBeforeFetch: expect.any(Function),
          onAfterFetch: expect.any(Function),
        });
      });

      test("treats functions starting with 'use' + uppercase as hooks", () => {
        const client = createMockClient();
        const fn = vi.fn((options?: any, _qc?: any) => options);
        const mod = { useQuery: fn };
        const wrapped = wrapGenerated(mod, client);

        wrapped.useQuery({ query: { enabled: true } });

        expect(fn).toHaveBeenCalledWith({
          query: { enabled: true },
          request: {
            baseUrl: testApiUrl,
            cookies: undefined,
            onBeforeFetch: expect.any(Function),
            onAfterFetch: expect.any(Function),
          },
        });
      });
    });
  });
});

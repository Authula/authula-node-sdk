import { afterEach, describe, expect, test, vi } from "vitest";

import { AuthulaClient } from "../client";
import { setDefaultClient } from "../runtime";
import { customFetch } from "./custom-fetch";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  setDefaultClient(undefined);
});

describe("customFetch default client resolution", () => {
  test("uses the default client's base URL when no options are supplied", async () => {
    const client = new AuthulaClient({
      url: "http://localhost:8080/api/auth/",
      plugins: [],
    });
    setDefaultClient(client);

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await customFetch("/users");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/users",
      expect.any(Object),
    );
  });

  test("uses the default client's cookies and hooks", async () => {
    const client = new AuthulaClient({
      url: "http://localhost:8080/api/auth",
      plugins: [],
      cookies: () => ({
        getAll: () => [{ name: "session", value: "abc" }],
        set: vi.fn(),
      }),
    });
    const beforeFetch = vi.fn();
    const afterFetch = vi.fn();
    client.registerBeforeFetch(beforeFetch);
    client.registerAfterFetch(afterFetch);
    setDefaultClient(client);

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await customFetch("/users");

    expect(beforeFetch).toHaveBeenCalledWith(
      expect.objectContaining({ url: "http://localhost:8080/api/auth/users" }),
    );
    expect(afterFetch).toHaveBeenCalledWith(expect.anything(), expect.any(Response));
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/users",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const init = fetchMock.mock.calls[0][1];
    expect((init.headers as Headers).get("cookie")).toBe("session=abc");
  });

  test("explicit baseUrl, cookies, and hooks override the default client", async () => {
    const client = new AuthulaClient({
      url: "http://localhost:8080/api/auth",
      plugins: [],
      cookies: () => ({
        getAll: () => [{ name: "default", value: "1" }],
        set: vi.fn(),
      }),
    });
    const defaultBeforeFetch = vi.fn();
    client.registerBeforeFetch(defaultBeforeFetch);
    setDefaultClient(client);

    const explicitBeforeFetch = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await customFetch("/users", {
      baseUrl: "http://override.test/api",
      cookies: () => ({
        getAll: () => [{ name: "override", value: "2" }],
        set: vi.fn(),
      }),
      onBeforeFetch: explicitBeforeFetch,
    });

    expect(defaultBeforeFetch).not.toHaveBeenCalled();
    expect(explicitBeforeFetch).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith("http://override.test/api/users", expect.any(Object));
    const init = fetchMock.mock.calls[0][1];
    expect((init.headers as Headers).get("cookie")).toBe("override=2");
  });

  test("throws a clear error for a relative URL when no client is configured", async () => {
    setDefaultClient(undefined);

    await expect(customFetch("/users")).rejects.toThrow(
      "No Authula client configured. Call createClient() before using Authula hooks, or pass a baseUrl request option.",
    );
  });

  test("allows an absolute URL without a client", async () => {
    setDefaultClient(undefined);

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(customFetch("https://example.com/api/users")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api/users", expect.any(Object));
  });
});

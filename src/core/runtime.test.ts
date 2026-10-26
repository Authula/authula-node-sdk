import { afterEach, describe, expect, test } from "vitest";

import { getDefaultClient, setDefaultClient } from "./runtime";
import { createClient } from "./sdk";

afterEach(() => {
  setDefaultClient(undefined);
});

describe("default client runtime", () => {
  test("createClient() registers the default client", () => {
    const client = createClient({
      url: "http://localhost:8080/api/auth",
      plugins: [],
    });

    expect(getDefaultClient()).toBe(client);
  });

  test("getDefaultClient() returns the most recently created client", () => {
    const first = createClient({
      url: "http://localhost:8080/first",
      plugins: [],
    });
    const second = createClient({
      url: "http://localhost:8080/second",
      plugins: [],
    });

    expect(getDefaultClient()).toBe(second);
    expect(getDefaultClient()).not.toBe(first);
  });

  test("setDefaultClient(undefined) clears the default", () => {
    createClient({
      url: "http://localhost:8080/api/auth",
      plugins: [],
    });

    setDefaultClient(undefined);

    expect(getDefaultClient()).toBeUndefined();
  });
});

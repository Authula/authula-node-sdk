import { describe, test, expect } from "vitest";
import { convertQueryKeysToSnakeCase } from "./custom-fetch";

describe("convertQueryKeysToSnakeCase", () => {
  test("returns URL unchanged when there are no query params", () => {
    expect(convertQueryKeysToSnakeCase("/api/users")).toBe("/api/users");
  });

  test("returns URL unchanged when query keys are already snake_case", () => {
    const result = convertQueryKeysToSnakeCase("/api-keys?owner_type=user&page=1");
    expect(result).toBe("/api-keys?owner_type=user&page=1");
  });

  test("converts single camelCase query key to snake_case", () => {
    const result = convertQueryKeysToSnakeCase("/admin/users?ownerType=user");
    expect(result).toBe("/admin/users?owner_type=user");
  });

  test("converts all camelCase query keys to snake_case", () => {
    const result = convertQueryKeysToSnakeCase(
      "/api-keys?ownerType=user&callbackUrl=https://example.com",
    );
    expect(result).toBe(
      "/api-keys?owner_type=user&callback_url=https%3A%2F%2Fexample.com",
    );
  });


  test("preserves mixed snake_case and camelCase keys", () => {
    const result = convertQueryKeysToSnakeCase(
      "/api/users?page=1&ownerType=admin&limit=50",
    );
    expect(result).toBe("/api/users?page=1&owner_type=admin&limit=50");
  });

  test("preserves multiple values for the same key", () => {
    const result = convertQueryKeysToSnakeCase(
      "/filter?userId=a&userId=b&userId=c",
    );
    expect(result).toBe("/filter?user_id=a&user_id=b&user_id=c");
  });

  test("handles values with special characters", () => {
    const result = convertQueryKeysToSnakeCase(
      "/search?callbackUrl=https%3A%2F%2Fexample.com%2Fpath%3Fa%3Db",
    );
    expect(result).toBe(
      "/search?callback_url=https%3A%2F%2Fexample.com%2Fpath%3Fa%3Db",
    );
  });

  test("handles empty query string", () => {
    const result = convertQueryKeysToSnakeCase("/api/users?");
    expect(result).toBe("/api/users?");
  });

  test("handles URLs with full domain", () => {
    const result = convertQueryKeysToSnakeCase(
      "https://api.example.com/users?ownerType=admin",
    );
    expect(result).toBe(
      "https://api.example.com/users?owner_type=admin",
    );
  });

  test("handles single-letter camelCase segments in keys", () => {
    const result = convertQueryKeysToSnakeCase("/items?aId=1&bId=2");
    expect(result).toBe("/items?a_id=1&b_id=2");
  });
});

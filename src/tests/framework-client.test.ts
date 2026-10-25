import { afterEach, describe, expect, expectTypeOf, test } from "vitest";

import { setDefaultClient } from "@/core/runtime";
import { createClient as createCoreClient } from "@/core/sdk";
import { AccessControlPlugin } from "@/plugins/access-control/plugin";
import { CorePlugin } from "@/plugins/core/plugin";
import { OrganizationsPlugin } from "@/plugins/organizations/plugin";
import { createClient as createReactClient } from "@/react";
import { createClient as createSolidClient } from "@/solid";
import type { createClient as createSvelteClient } from "@/svelte";
import { createClient as createVueClient } from "@/vue";

import type { CorePlugin as CorePluginInstance } from "@/plugins/core/plugin";

const url = "http://localhost:8080/api/auth";

afterEach(() => {
  setDefaultClient(undefined);
});

describe("framework-aware createClient", () => {
  test("React client exposes core hooks and direct methods", () => {
    const client = createReactClient({
      url,
      plugins: [new CorePlugin(), new OrganizationsPlugin(), new AccessControlPlugin()],
    });

    expect(typeof client.core.useGetMe).toBe("function");
    expect(typeof client.core.getMe).toBe("function");
    expect(typeof client.organizations.useListOrganizations).toBe("function");
    expect(typeof client.organizations.listOrganizations).toBe("function");
    expect(typeof client.accessControl.useCreateRole).toBe("function");
    expect((client.core as any).useListOrganizations).toBeUndefined();

    expectTypeOf(client.core.useGetMe).toBeFunction();
    expectTypeOf(client.core.getMe).toBeFunction();
    expectTypeOf(client.organizations.useListOrganizations).toBeFunction();
    expectTypeOf(client.accessControl.useCreateRole).toBeFunction();

    // Hooks stay scoped to the plugin that owns the request function.
    // @ts-expect-error core has no useListOrganizations hook
    void client.core.useListOrganizations;
    // @ts-expect-error organizations has no useGetMe hook
    void client.organizations.useGetMe;
  });

  test("Vue client exposes core hooks and direct methods", () => {
    const client = createVueClient({
      url,
      plugins: [new CorePlugin(), new OrganizationsPlugin()],
    });

    expect(typeof client.core.useGetMe).toBe("function");
    expect(typeof client.core.getMe).toBe("function");
    expect(typeof client.organizations.useListOrganizations).toBe("function");
    expectTypeOf(client.core.useGetMe).toBeFunction();
  });

  test("Solid client exposes core hooks and direct methods", () => {
    const client = createSolidClient({
      url,
      plugins: [new CorePlugin(), new OrganizationsPlugin()],
    });

    expect(typeof client.core.useGetMe).toBe("function");
    expect(typeof client.core.getMe).toBe("function");
    expect(typeof client.organizations.useListOrganizations).toBe("function");
    expectTypeOf(client.core.useGetMe).toBeFunction();
  });

  test("core createClient does not attach hooks", () => {
    const client = createCoreClient({
      url,
      plugins: [new CorePlugin()],
    });

    expect(typeof client.core.getMe).toBe("function");
    expect((client.core as any).useGetMe).toBeUndefined();
  });
});

type SvelteClient = ReturnType<
  typeof createSvelteClient<[CorePluginInstance, InstanceType<typeof OrganizationsPlugin>]>
>;

declare const svelteClient: SvelteClient;

describe("Svelte client types", () => {
  test("Svelte hooks use the create prefix", () => {
    expectTypeOf<typeof svelteClient.core.createGetMe>().toBeFunction();
    expectTypeOf<typeof svelteClient.core.getMe>().toBeFunction();
    expectTypeOf<typeof svelteClient.organizations.createListOrganizations>().toBeFunction();

    // @ts-expect-error Svelte uses createGetMe, not useGetMe
    expectTypeOf<typeof svelteClient.core.useGetMe>();
  });
});

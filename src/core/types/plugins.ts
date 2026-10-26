import type { AuthulaClient } from "../client";

export interface Plugin {
  readonly id: string;
  init(client: AuthulaClient): any;
}

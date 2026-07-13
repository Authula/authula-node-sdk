export type FetchContext = {
  url: string;
  init: RequestInit;
  /** internal metadata for plugins */
  meta: {
    retry?: boolean;
  };
  /** resolved cookies available during the request lifecycle */
  cookies?: Record<string, string | undefined>;
};

export type BeforeFetchHook = (ctx: FetchContext) => Promise<void> | void;

export type AfterFetchHook = (
  ctx: FetchContext,
  res: Response,
) => Promise<"retry" | void> | "retry" | void;

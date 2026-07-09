export type FetchContext = {
  url: string;
  init: RequestInit;
  /** internal metadata for plugins */
  meta: {
    retry?: boolean;
  };
};

export type BeforeFetchHook = (ctx: FetchContext) => Promise<void> | void;

export type AfterFetchHook = (
  ctx: FetchContext,
  res: Response,
) => Promise<"retry" | void> | "retry" | void;

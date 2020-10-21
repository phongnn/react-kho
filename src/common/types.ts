import { Query } from "kho"

declare module "kho" {
  export interface StoreOptions {
    suspenseQueryMountTimeout: number
  }
}

export interface FetchMoreFn<TResult, TArguments, TContext> {
  (options?: {
    arguments?: TArguments
    context?: TContext
    query?: Query<TResult, TArguments, TContext>
  }): void
}

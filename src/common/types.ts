import { Query } from "kho"

declare module "kho" {
  export interface StoreOptions {
    suspenseQueryMountTimeout: number
  }
}

export interface FetchMoreFn<TArguments, TContext> {
  (options?: { arguments?: TArguments; context?: TContext }): void
}

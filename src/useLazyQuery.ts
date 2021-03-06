import { useRef, useEffect } from "react"
import { QueryOptions, Query } from "kho"

import { useAdvancedStore } from "./Provider"
import {
  useDataLoadingState,
  DataLoadingState,
  registerQuery,
} from "./common/useDataLoadingState"

export function useLazyQuery<TResult, TArguments, TContext>(
  query: Query<TResult, TArguments, TContext>
) {
  const store = useAdvancedStore()
  const { state, dispatch } = useDataLoadingState(query)

  const unregisterFn = useRef<() => void>()

  const fetchData = (
    // prettier-ignore
    options?: Pick<QueryOptions<TResult, TArguments, TContext>, "arguments" | "context" | "expiryMs" | "fetchPolicy">
  ) => {
    if (unregisterFn.current) {
      unregisterFn.current() // clean up first, just in case user calls fetchData() more than once
    }

    const actualQuery = options ? query.withOptions(options) : query
    unregisterFn.current = registerQuery(store, actualQuery, dispatch)
  }

  useEffect(() => unregisterFn.current, [unregisterFn.current])

  // prettier-ignore
  return [fetchData, state] as [typeof fetchData, DataLoadingState<TResult, TArguments, TContext>]
}

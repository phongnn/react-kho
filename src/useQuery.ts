import { QueryOptions, Query } from "kho"

import { useAdvancedStore } from "./Provider"
import { useCustomEffect } from "./common/customHooks"
// prettier-ignore
import { useDataLoadingState, registerQuery } from "./common/useDataLoadingState"
import { useEffect, useRef } from "react"

export function useQuery<TResult, TArguments, TContext>(
  query: Query<TResult, TArguments, TContext>,
  options?: Omit<QueryOptions<TResult, TArguments, TContext>, "shape" | "merge">
) {
  const store = useAdvancedStore()
  const { state, dispatch } = useDataLoadingState(query)

  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [mountedRef])

  useCustomEffect(() => {
    const actualQuery = !options ? query : query.withOptions(options)
    // return unregister fn
    return registerQuery(
      store,
      actualQuery,
      (action) => mountedRef.current && dispatch(action)
    )
  }, [store, dispatch, query, options])

  return state
}

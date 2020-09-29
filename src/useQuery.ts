import { QueryOptions, Query } from "kho"

import { useAdvancedStore } from "./Provider"
import { useCustomEffect } from "./common/customHooks"
// prettier-ignore
import { useDataLoadingState, registerQuery } from "./common/useDataLoadingState"

export function useQuery<TResult, TArguments, TContext>(
  query: Query<TResult, TArguments, TContext>,
  options?: Omit<QueryOptions<TResult, TArguments, TContext>, "shape" | "merge">
) {
  const store = useAdvancedStore()
  const { state, dispatch } = useDataLoadingState(query)

  useCustomEffect(() => {
    const actualQuery = !options ? query : query.withOptions(options)
    return registerQuery(store, actualQuery, dispatch) // return unregister fn
  }, [store, dispatch, query, options])

  return state
}

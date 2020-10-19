import { useEffect, useRef } from "react"
import { QueryOptions, Query, Store } from "kho"

import { useAdvancedStore } from "./Provider"
import { deepEqual } from "./common/helpers"
// prettier-ignore
import { useDataLoadingState, registerQuery } from "./common/useDataLoadingState"

export function useQuery<TResult, TArguments, TContext>(
  query: Query<TResult, TArguments, TContext>,
  // prettier-ignore
  options?: Pick<QueryOptions<TResult, TArguments, TContext>, "arguments" | "context" | "expiryMs" | "fetchPolicy">
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
    const unregisterFn = registerQuery(
      store,
      actualQuery,
      (action) => mountedRef.current && dispatch(action)
    )
    return unregisterFn
  }, [store, dispatch, query, options])

  return state
}

// =============== helper functions ===============

type DependencyList = [
  Store,
  React.Dispatch<any>,
  Query<any, any, any>,
  QueryOptions<any, any, any> | undefined
]

function useCustomEffect(fn: () => void, dependencies: DependencyList) {
  const depRef = useRef(dependencies)
  if (hasChanges(depRef.current, dependencies)) {
    depRef.current = dependencies
  }
  useEffect(fn, depRef.current)
}

function hasChanges(currentDeps: DependencyList, newDeps: DependencyList) {
  const [cStore, cDispatch, cQuery, cOptions = {}] = currentDeps
  const [nStore, nDispatch, nQuery, nOptions = {}] = newDeps
  return (
    nStore !== cStore ||
    nDispatch !== cDispatch ||
    nQuery !== cQuery ||
    !deepEqual(nOptions.arguments, cOptions.arguments)
  )
}

import { Reducer, useCallback, useEffect, useReducer } from "react"
import {
  FetchMoreFn as InternalFetchMoreFn,
  RefetchFn as InternalRefetchFn,
  Query,
  QueryOptions,
} from "kho"

import { useAdvancedStore } from "./Provider"
import { FetchMoreFn } from "./common/types"

export interface CustomState<TResult> {
  data: TResult
  fetchingMore: boolean
  fetchMoreError: Error | null
  refetching: boolean
  refetchError: Error | null
}

type CustomAction<TResult> =
  | { type: "ACTION_FETCH_MORE_REQUEST" }
  | { type: "ACTION_FETCH_MORE_FAILURE"; payload: Error }
  | { type: "ACTION_FETCH_MORE_SUCCESS" }
  | { type: "ACTION_REFETCH_REQUEST" }
  | { type: "ACTION_REFETCH_FAILURE"; payload: Error }
  | { type: "ACTION_REFETCH_SUCCESS" }
  | { type: "ACTION_DATA"; payload: TResult }

export function useCustomState<TResult>(initialData: TResult) {
  const initialState: CustomState<TResult> = {
    data: initialData,
    fetchingMore: false,
    fetchMoreError: null,
    refetching: false,
    refetchError: null,
  }

  const [state, dispatch] = useReducer<
    Reducer<CustomState<TResult>, CustomAction<TResult>>
  >((currentState, action) => {
    switch (action.type) {
      case "ACTION_FETCH_MORE_REQUEST":
        return { ...currentState, fetchingMore: true, fetchMoreError: null }
      case "ACTION_FETCH_MORE_FAILURE":
        return {
          ...currentState,
          fetchingMore: false,
          fetchMoreError: action.payload,
        }
      case "ACTION_FETCH_MORE_SUCCESS":
        return { ...currentState, fetchingMore: false }
      case "ACTION_REFETCH_REQUEST":
        return { ...currentState, refetching: true, refetchError: null }
      case "ACTION_REFETCH_FAILURE":
        return {
          ...currentState,
          refetching: false,
          refetchError: action.payload,
        }
      case "ACTION_REFETCH_SUCCESS":
        return { ...currentState, refetching: false }
      case "ACTION_DATA":
        return { ...currentState, data: action.payload }
      default:
        return currentState
    }
  }, initialState)

  return { state, dispatch }
}

interface SuspenseQueryEntry<TResult, TArguments, TContext> {
  unregister?: () => void
  refetch?: InternalRefetchFn
  fetchMore?: InternalFetchMoreFn<TResult, TArguments, TContext>
  promise?: Promise<void>
  error?: Error
  data?: TResult
  onData?: (data: TResult) => void
  mounted?: boolean
}
// prettier-ignore
const suspenseQueryRegistry = new Map<string, SuspenseQueryEntry<any, any, any>>()

function removeSuspenseQuery(key: string) {
  suspenseQueryRegistry.get(key)?.unregister!()
  suspenseQueryRegistry.delete(key)
}

function removeIfNotMounted(key: string) {
  const entry = suspenseQueryRegistry.get(key)
  if (entry && !entry.mounted) {
    entry.unregister!()
    suspenseQueryRegistry.delete(key)
  }
}

export function useSuspenseQuery<TResult, TArguments, TContext>(
  // key: string,
  query: Query<TResult, TArguments, TContext>,
  // prettier-ignore
  options?: { key?: string } & Pick<QueryOptions<TResult, TArguments, TContext>, "arguments" | "context" | "expiryMs" | "fetchPolicy">
) {
  const store = useAdvancedStore()
  const realQuery = !options ? query : query.withOptions(options)
  const key =
    options && options.key
      ? options.key
      : !realQuery.options.arguments
      ? realQuery.name
      : `${realQuery.name}--${JSON.stringify(realQuery.options.arguments)}`

  const existingEntry = suspenseQueryRegistry.get(key)
  if (!existingEntry) {
    let promiseFulfilled = false
    const promise = new Promise<void>((resolve) => {
      // prettier-ignore
      const { unregister, fetchMore, refetch } = store.registerQuery<TResult, TArguments, TContext>(
        realQuery, 
        {
          onError: (err) => {
            const entry = suspenseQueryRegistry.get(key)
            if (entry) {
              entry.promise = undefined
              entry.error = err
            } else {
              suspenseQueryRegistry.set(key, { error: err })
            }

            promiseFulfilled = true
            // user might have opened a different view by the time this request finishes -> clean up
            setTimeout(() => removeIfNotMounted(key), store.options.suspenseQueryMountTimeout)
            resolve()
          },
          onData: (data) => {
            const entry = suspenseQueryRegistry.get(key)
            if (entry?.onData) {
              return entry.onData(data)
            }
            
            if (entry) {
              entry.promise = undefined
              entry.data = data
            } else {
              suspenseQueryRegistry.set(key, { data })
            }

            promiseFulfilled = true
            // user might have opened a different view by the time this request finishes -> clean up
            setTimeout(() => removeIfNotMounted(key), store.options.suspenseQueryMountTimeout)
            resolve()
          }
        }
      )

      const entry = suspenseQueryRegistry.get(key)
      if (!entry) {
        // prettier-ignore
        suspenseQueryRegistry.set(key, { unregister, fetchMore, refetch })
      } else {
        Object.assign(entry, { unregister, fetchMore, refetch })
      }
    })

    if (!promiseFulfilled) {
      suspenseQueryRegistry.get(key)!.promise = promise.catch()
    }
    throw promise.catch()
  } else if (existingEntry.promise) {
    throw existingEntry.promise
  } else if (existingEntry.error) {
    throw existingEntry.error
  }

  useEffect(() => {
    existingEntry.mounted = true
    return () => removeSuspenseQuery(key)
  }, [key, existingEntry])

  const { state, dispatch } = useCustomState<TResult>(existingEntry.data)
  const refetch = useCallback(
    () =>
      existingEntry.refetch!({
        onRequest: () => dispatch({ type: "ACTION_REFETCH_REQUEST" }),
        onError: (err) =>
          dispatch({ type: "ACTION_REFETCH_FAILURE", payload: err }),
        onComplete: () => dispatch({ type: "ACTION_REFETCH_SUCCESS" }),
      }),
    [existingEntry]
  )
  const fetchMore = useCallback(
    ({ arguments: args, context, query: anotherQuery } = {}) => {
      // prettier-ignore
      const nextQuery = (anotherQuery || realQuery).withOptions({ arguments: args, context })
      existingEntry.fetchMore!(nextQuery, {
        onRequest: () => dispatch({ type: "ACTION_FETCH_MORE_REQUEST" }),
        onError: (err) =>
          dispatch({ type: "ACTION_FETCH_MORE_FAILURE", payload: err }),
        onComplete: () => dispatch({ type: "ACTION_FETCH_MORE_SUCCESS" }),
      })
    },
    [existingEntry]
  )

  if (!existingEntry.onData) {
    existingEntry.onData = (data: TResult) =>
      existingEntry.mounted && dispatch({ type: "ACTION_DATA", payload: data })
  }

  return {
    ...state,
    refetch,
    fetchMore: fetchMore as FetchMoreFn<TArguments, TContext>,
  }
}

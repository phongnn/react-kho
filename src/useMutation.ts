import { useReducer, Reducer } from "react"
import { MutationOptions, Mutation } from "kho"

import { useAdvancedStore } from "./Provider"

interface MutationState<TResult> {
  loading: boolean
  error: Error | null
  data: TResult | null
  called: boolean
}

type MutationAction<TResult> =
  | { type: "ACTION_REQUEST" }
  | { type: "ACTION_FAILURE"; payload: Error }
  | { type: "ACTION_SUCCESS"; payload: TResult }

const initialState: MutationState<any> = {
  loading: false,
  error: null,
  called: false,
  data: null,
}

function useCustomState<TResult>() {
  const [state, dispatch] = useReducer<
    Reducer<MutationState<TResult>, MutationAction<TResult>>
  >((currentState, action) => {
    switch (action.type) {
      case "ACTION_REQUEST":
        return { loading: true, error: null, called: false, data: null }
      case "ACTION_FAILURE":
        return {
          loading: false,
          called: true,
          error: action.payload,
          data: null,
        }
      case "ACTION_SUCCESS":
        return {
          loading: false,
          called: true,
          error: null,
          data: action.payload,
        }
      default:
        return currentState
    }
  }, initialState)

  return { state, dispatch }
}

export function useMutation<TResult, TArguments, TContext>(
  mutation: Mutation<TResult, TArguments, TContext>,
  options: Omit<
    MutationOptions<TResult, TArguments, TContext>,
    "shape" | "update"
  > = {}
) {
  const store = useAdvancedStore()
  const { state, dispatch } = useCustomState<TResult>()
  const originalOptions = options

  const mutate = (
    options: Pick<
      MutationOptions<TResult, TArguments, TContext>,
      "arguments" | "context"
    > = {}
  ) => {
    const actualMutation = mutation.withOptions(originalOptions, options)
    store.processMutation(actualMutation, {
      onRequest: () => dispatch({ type: "ACTION_REQUEST" }),
      onError: (err) => dispatch({ type: "ACTION_FAILURE", payload: err }),
      onComplete: (data) => dispatch({ type: "ACTION_SUCCESS", payload: data }),
    })
  }

  return [mutate, state] as [typeof mutate, MutationState<TResult>]
}

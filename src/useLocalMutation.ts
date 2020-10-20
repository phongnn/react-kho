import { useReducer, Reducer, useRef, useEffect, useCallback } from "react"
import { LocalMutation } from "kho"

import { useAdvancedStore } from "./Provider"

interface MutationState {
  loading: boolean
  error: Error | null
  called: boolean
}

type MutationAction =
  | { type: "ACTION_REQUEST" }
  | { type: "ACTION_FAILURE"; payload: Error }
  | { type: "ACTION_SUCCESS" }

const initialState: MutationState = {
  loading: false,
  error: null,
  called: false,
}

function useCustomState() {
  const [state, dispatch] = useReducer<Reducer<MutationState, MutationAction>>(
    (currentState, action) => {
      switch (action.type) {
        case "ACTION_REQUEST":
          return { loading: true, error: null, called: false }
        case "ACTION_FAILURE":
          return {
            loading: false,
            called: true,
            error: action.payload,
          }
        case "ACTION_SUCCESS":
          return {
            loading: false,
            called: true,
            error: null,
          }
        default:
          return currentState
      }
    },
    initialState
  )

  return { state, dispatch }
}

export function useLocalMutation<Input>(mutation: LocalMutation<Input>) {
  const store = useAdvancedStore()
  const { state, dispatch } = useCustomState()

  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  })

  const mutate = useCallback(
    (options?: { input?: Input; syncMode?: boolean }) => {
      const actualMutation = options ? mutation.withOptions(options) : mutation
      dispatch({ type: "ACTION_REQUEST" })
      // prettier-ignore
      store.processLocalMutation(actualMutation, {
        onError: (err) =>
          mountedRef.current && dispatch({ type: "ACTION_FAILURE", payload: err }),
        onComplete: () => 
          mountedRef.current && dispatch({ type: "ACTION_SUCCESS" })
      })
    },
    [store, dispatch, mutation]
  )

  return [mutate, state] as [typeof mutate, MutationState]
}

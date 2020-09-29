import { useRef, useCallback, useEffect } from "react"
import { Mutation, MutationOptions, Query, QueryOptions, Store } from "kho"
import { deepEqual } from "./helpers"

type DependencyList = [
  Store,
  React.Dispatch<any>,
  Query<any, any, any> | Mutation<any, any, any>,
  QueryOptions<any, any, any> | MutationOptions<any, any, any> | undefined
]

export function useCustomCallback<F extends (...args: any[]) => void>(
  fn: F,
  dependencies: DependencyList
) {
  const depRef = useRef(dependencies)
  if (hasChanges(depRef.current, dependencies)) {
    depRef.current = dependencies
  }

  return useCallback(fn, depRef.current)
}

export function useCustomEffect(fn: () => void, dependencies: DependencyList) {
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

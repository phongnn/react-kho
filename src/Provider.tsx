import React, { ReactElement, useContext } from "react"
// prettier-ignore
import { Store, AdvancedStore, StoreOptions, createStore as originalCreateStore } from "kho"

const StoreContext = React.createContext<Store | null>(null)

export function Provider(props: { store: Store; children: ReactElement }) {
  const { store, children } = props
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useAdvancedStore() {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error(
      "Data store not found. Make sure you have a Provider component in the tree."
    )
  }
  return store as AdvancedStore
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error(
      "Data store not found. Make sure you have a Provider component in the tree."
    )
  }
  return store
}

export const createStore = (
  // don't expose suspenseQueryMountTimeout option for now (maybe later if it becomes necessary)
  options: Partial<Pick<StoreOptions, "preloadedState" | "queryExpiryMs">> = {}
) =>
  originalCreateStore({
    suspenseQueryMountTimeout: 5 * 1000, // 5 seconds
    ...options,
  })

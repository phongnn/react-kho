import React from "react"
import { Query, createStore } from "kho"
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useQuery } from "../useQuery"
import { Provider } from "../Provider"

let count = 0
const query = new Query("GetData", () => {
  if (++count < 3) {
    return Promise.reject("some err")
  } else {
    return Promise.resolve(count)
  }
})

function DataLoadingComponent() {
  const { data, error, retry, loading } = useQuery(query)
  return (
    <div>
      {loading && <span>loading...</span>}
      {error && (
        <div>
          <span>{error.message}</span>
          <button onClick={retry}>Retry</button>
        </div>
      )}
      {data && <p>data: {data}</p>}
    </div>
  )
}

it("should retry and show loaded data", async () => {
  render(
    <Provider store={createStore()}>
      <DataLoadingComponent />
    </Provider>
  )

  jest.spyOn(console, "error").mockImplementation(() => {})
  await waitForElementToBeRemoved(screen.getByText("loading..."))
  userEvent.click(screen.getByText("Retry"))
  await waitForElementToBeRemoved(screen.getByText("loading..."))
  userEvent.click(screen.getByText("Retry"))
  await waitForElementToBeRemoved(screen.getByText("loading..."))
  expect(screen.getByText("data: 3")).toBeInTheDocument()
})

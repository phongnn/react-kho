import React, { useRef } from "react"
// prettier-ignore
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Query } from "kho"

import { useQuery, Provider, createStore } from ".."

let getDataForPage = (pageIndex: number) => {
  const offset = (pageIndex - 1) * 10
  return Promise.resolve(
    [...Array(10)].map((_, i) => `item # ${offset + i + 1}`)
  )
}

const query = new Query(
  "GetPage",
  (args: { pageIndex: number }) =>
    Promise.resolve(getDataForPage(args.pageIndex)),
  {
    arguments: {
      pageIndex: 1,
    },
    merge: (existingData, newData) => [...existingData, ...newData],
  }
)

function DataLoadingComponent() {
  const pageIndex = useRef(1)
  const { data, fetchMore, fetchingMore, fetchMoreError } = useQuery(query)
  if (!data) {
    return null
  }

  return (
    <div>
      <ul>
        {data.map((item) => (
          <li key={item}>
            <span>***</span> {item}
          </li>
        ))}
      </ul>
      <nav>
        <button
          onClick={() => {
            pageIndex.current = pageIndex.current + 1
            fetchMore({ arguments: { pageIndex: pageIndex.current } })
          }}
        >
          More
        </button>
        {fetchingMore && <span>Fetching more...</span>}
        {fetchMoreError && (
          <span>{fetchMoreError.message || "Unknown error"}</span>
        )}
      </nav>
    </div>
  )
}

it("should fetch and show more data", async () => {
  render(
    <Provider store={createStore()}>
      <DataLoadingComponent />
    </Provider>
  )

  userEvent.click(await screen.findByText("More"))
  await waitForElementToBeRemoved(screen.getByText("Fetching more..."))
  expect(screen.getAllByText("***").length).toBe(20)
})

it("should show fetchMore error", async () => {
  render(
    <Provider store={createStore()}>
      <DataLoadingComponent />
    </Provider>
  )

  jest.spyOn(console, "error").mockImplementation(() => {})
  getDataForPage = jest.fn().mockRejectedValue("a strange error")

  userEvent.click(await screen.findByText("More"))
  await waitForElementToBeRemoved(screen.getByText("Fetching more..."))
  expect(screen.getByText(/a strange error/)).toBeInTheDocument()
})

import React from "react"
// prettier-ignore
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LocalMutation } from "kho"

import { Provider, createStore, useLocalMutation } from ".."

const mutation = new LocalMutation<number>("UpdateData", {
  afterQueryUpdates: async (store, { mutationInput: input }) => {
    if (input % 2 === 1) {
      throw new Error(`Input should be an even number.`)
    }
  },
  syncMode: true,
})

function MyComponent(props: { input: number }) {
  const [mutate, { loading, error, called }] = useLocalMutation(mutation)
  return (
    <div>
      <button disabled={loading} onClick={() => mutate({ input: props.input })}>
        Mutate
      </button>
      {loading && <p>Processing...</p>}
      {error && <p>{error.message || "Unknown error"}</p>}
      {called && <p>Data has been updated successfully.</p>}
    </div>
  )
}

function renderComponent(input: number) {
  render(
    <Provider store={createStore()}>
      <MyComponent input={input} />
    </Provider>
  )
}

it("should show success message", async () => {
  renderComponent(2)

  userEvent.click(screen.getByText("Mutate"))
  await waitForElementToBeRemoved(screen.getByText("Processing..."))
  expect(
    screen.getByText("Data has been updated successfully.")
  ).toBeInTheDocument()
})

it("should show mutation error", async () => {
  renderComponent(1)
  userEvent.click(screen.getByText("Mutate"))
  expect(
    await screen.findByText(/Input should be an even number/)
  ).toBeInTheDocument()
})

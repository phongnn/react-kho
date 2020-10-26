import React from "react"
// prettier-ignore
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Mutation } from "kho"

import { Provider, createStore, useMutation } from ".."

let mutateFn: (args: any, ctx: any) => Promise<string>
const mutation = new Mutation(
  "UpdateData",
  (args: any, ctx: any) => mutateFn(args, ctx),
  {
    context: { blah: "blah" },
  }
)

function MyComponent() {
  const [mutate, { loading, error, called, data }] = useMutation(mutation)
  return (
    <div>
      <button
        disabled={loading}
        onClick={() =>
          mutate({ arguments: { x: { y: "z" } }, context: { token: "aaa" } })
        }
      >
        Mutate
      </button>
      {loading && <p>Processing...</p>}
      {error && <p>{error.message || "Unknown error"}</p>}
      {data && <p>Result: {data}</p>}
      {called && <p>Data has been updated successfully.</p>}
    </div>
  )
}

function renderWithMutateFn(fn: typeof mutateFn) {
  mutateFn = fn
  render(
    <Provider store={createStore()}>
      <MyComponent />
    </Provider>
  )
}

it("should invoke mutate function and show success message", async () => {
  const fn = jest.fn().mockResolvedValue("ok")
  renderWithMutateFn(fn)

  userEvent.click(screen.getByText("Mutate"))
  await waitForElementToBeRemoved(screen.getByText("Processing..."))
  expect(screen.getByText("Result: ok")).toBeInTheDocument()
  // prettier-ignore
  expect(screen.getByText("Data has been updated successfully.")).toBeInTheDocument()

  expect(fn).toBeCalledWith({ x: { y: "z" } }, { token: "aaa", blah: "blah" })
})

it("should show mutation error", async () => {
  renderWithMutateFn(jest.fn().mockRejectedValue("a strange error"))

  jest.spyOn(console, "error").mockImplementation(() => {})

  userEvent.click(screen.getByText("Mutate"))
  expect(await screen.findByText(/a strange error/)).toBeInTheDocument()
})

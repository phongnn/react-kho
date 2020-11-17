# Local Mutations

A local mutation is similar to a mutation but only updates client-side cache. It doesn't have a function to update data at backend.

## Local mutation objects

The `LocalMutation` constructor takes two arguments: a unique name and an object for mutation options:

```javascript
import { LocalMutation } from "react-kho"
import { ArticleType } from "./normalizedTypes"

const articlePostedMutation = new Mutation("NewArticlePosted", {
  inputShape: ArticleType,
  queryUpdates: {
    /* settings here */
  },
})
```

```javascript
// for example, from a web socket endpoint
store.mutateLocal(articlePostedMutation, { input: newArticle })
```

## Using a local mutation to update cache

There are four options for updating cache with a local mutation:

- `inputShape`: parses the mutation's input and updates normalized objects in cache (see [Data normalization](DataNormalization.md)).
- `queryUpdates`: updates related queries' data.
- `beforeQueryUpdates`: usually used for deleting or updating normalized objects in cache.
- `afterQueryUpdates`: refetches related queries, resets store, etc.

Check out [the documentation on mutations](Mutations.md#updating-client-side-cache) for how to use `queryUpdates`, `beforeQueryUpdates` and `afterQueryUpdates`.

## Using a local mutation from views with `useLocalMutation` hook

This hook returns a function to call when you want to mutate data, and an object which represents the mutation's state.

```javascript
import { useLocalMutation } from "react-kho"

export function MyComponent() {
  const [mutate, { loading, called, error }] = useLocalMutation(aLocalMutation)

  useEffect(() => {
    if (called && !error) {
      // show a toast
    }
  }, [called, error])

  return (
    <div>
      <button onClick={() => mutate({ input })}>Update data</button>
    </div>
  )
```

When calling the function to mutate data, you can provide an object to specify/override two values:

- `input`: data in _non-normalized_ format
- `syncMode`: if set to `true`, the mutation only completes when `afterQueryUpdates` has finished (default value is `false`).

The object representing mutation state has the following properties:

| Property | Type    | Description                                             |
| -------- | ------- | ------------------------------------------------------- |
| loading  | boolean | Is the mutation in progress?                            |
| error    | Error   | Error that occurs during the processing of the mutation |
| called   | boolean | Has the mutation completed yet?                         |

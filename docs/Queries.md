# Queries

You have to define a query in order to fetch data from backend.

- [Query objects](#query-objects)
- [Data fetching function](#data-fetching-function)
- [Query options](#query-options)
- [Hooks: when to use which?](#hooks-when-to-use-which)
- [useQuery](#usequery)
- [useLazyQuery](#uselazyquery)
- [useSuspenseQuery](#usesuspensequery)

## Query objects

The `Query` constructor takes three arguments: a _unique_ name, an _asynchronous_ data fetching function and, optionally, an object for query options:

```javascript
import { Query } from "react-kho"
import { getGlobalFeed } from "../api"
import { ArticleType } from "./normalizedTypes"

const query = new Query("GlobalFeed", getGlobalFeed, {
  shape: {
    articles: [ArticleType],
  },
})
```

## Data fetching function

This function should return a promise or use the `async` keyword. It accepts as optional inputs two _plain_ JavaScript objects:

- `args` contains the arguments required for data fetching.
- `context` can be used for passing metadata such as HTTP request headers.

```javascript
import { Query } from "react-kho"
import { getGlobalFeed } from "../api"

const globalFeedQuery = new Query("GlobalFeed", (args, ctx) =>
  getGlobalFeed(args.limit, args.offset)
)
```

If you use TypeScript, make sure to declare the return type for the underlying data fetching function (`getGlobalFeed()` in the above snippet) to enjoy full benefits of auto-completion.

## Query options

| Option       | Description                                                                                                                                                                        | Default value           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| arguments    | Default arguments for the data fetching function.                                                                                                                                  | None                    |
| context      | Default context value for the data fetching function.                                                                                                                              | None                    |
| expiryMs     | Specifies when this query's data expires and needs to be refetched (only if it's still active; inactive query will be removed from cache)                                          | Store's `queryExpiryMs` |
| shape        | Specifies how to normalize the query's data. See [Data Normalization](DataNormalization.md).                                                                                       | None                    |
| fetchPolicy  | `cache-first`, `cache-and-network`, `network-only`                                                                                                                                 | `cache-first`           |
| merge        | For [infinite queries](Recipes.md#infinite-queries)                                                                                                                                | None                    |
| queryUpdates | Updates other queries based on this query's data. See [recipe](Recipes.md#updating-other-queries-based-on-a-querys-data)                                                           | None                    |
| selector     | Only needed when the first request to backend may return blank result AND you want to update this query's data from a related mutation/query. See [caution](Cautions.md#selector). | None                    |

## Hooks: when to use which?

Use a suitable hook depending on _when_ you want to fetch data:

- `useQuery`: fetches data when component is mounted (fetch on render). This is what you need in most cases.
- `useLazyQuery`: fetches data on demand.
- `useSuspenseQuery`: render as you fetch, for use with React's Suspense.

## useQuery

This hook fetches data when component is mounted.

```javascript
import { useQuery } from "react-kho"
import { globalFeedQuery } from "../store"

function MyComponent() {
  const { loading, error, data } = useQuery(globalFeedQuery, {
    arguments: { limit: 20, offset: 0 },
  })

  if (loading) {
    return <p>loading...</p>
  } else if (error) {
    return <p>{error.message}</p>
  } else if (data) {
    return data.map(({ slug, title }) => <p key={slug}>{title}</p>)
  } else {
    return null
  }
}
```

`useQuery` takes as input a query object and, optionally, an object which allows you to specify/override some query options: `arguments`, `context`, `expiryMs`, and `fetchPolicy`. The hook returns an object with the following properties:

| Property       | Type     | Description                                                                                                                     |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| loading        | boolean  | Is data being fetched?                                                                                                          |
| data           | any      | Data fetched from backend                                                                                                       |
| error          | Error    | Error that occurs when trying to fetch data                                                                                     |
| called         | boolean  | Has the query been called yet?                                                                                                  |
| fetchMore      | function | For [infinite queries](Recipes.md#infinite-queries): <br/> `(options?: { arguments?: TArguments; context?: TContext }) => void` |
| fetchingMore   | boolean  | Is data being fetched with `fetchMore()`?                                                                                       |
| fetchMoreError | Error    | Error that occurs when processing `fetchMore()`                                                                                 |
| refetch        | function | Request latest data from backend <br/> `() => void`                                                                             |
| refetching     | boolean  | Is data being fetched with `refetch()`                                                                                          |
| refetchError   | Error    | Error that occurs when processing `refetch()`                                                                                   |
| retry          | function | Retry a _failed_ request <br/> `() => void`                                                                                     |

## useLazyQuery

This hook fetches data on demand. It returns a function to call whenever you want to fetch data, and an object which represents the data fetching state.

```javascript
import { useLazyQuery } from "react-kho"
import { globalFeedQuery } from "../store"

function MyComponent() {
  const [getFeed, { loading, error, data }] = useLazyQuery(globalFeedQuery)
  return (
    <div>
      <button
        disabled={loading}
        onClick={() =>
          getFeed({
            arguments: { limit: 20, offset: 0 },
          })
        }
      >
        Load
      </button>
      {error && <p>Error: {error.message}</p>}
      {data && data.map(({ slug, title }) => <p key={slug}>{title}</p>)}
    </div>
  )
}
```

When calling the function to fetch data, you can provide an object to specify/override some query options: `arguments`, `context`, `expiryMs`, and `fetchPolicy`.

`useLazyQuery` has the same properties of data fetching state as [`useQuery`](#usequery).

## useSuspenseQuery

This hook allows views to render while data is being fetched. It must be used with `Suspense`. It's important to note that Suspense for data fetching is still an an [experimental feature](https://reactjs.org/docs/concurrent-mode-suspense.html) and not recommended for use in production.

```javascript
import { useSuspenseQuery } from "react-kho"
import { globalFeedQuery } from "../store"

function MyComponent() {
  const { data } = useSuspenseQuery(globalFeedQuery, {
    arguments: { limit: 20, offset: 0 },
  })

  return !data ? null : data.map(({ slug, title }) => <p key={slug}>{title}</p>)
}
```

```javascript
import { Suspense } from "react"

const App = () => (
  <ErrorBoundary fallback={<p>Error!!!</p>}>
    <Suspense fallback={<Spinner />}>
      <MyComponent />
    </Suspense>
  </ErrorBoundary>
)
```

`useSuspenseQuery` takes as input a query object and, optionally, an object which allows you to specify/override some query options: `arguments`, `context`, `expiryMs`, and `fetchPolicy`. The hook returns an object with the following properties:

| Property       | Type     | Description                                                                                                                     |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| data           | any      | Data fetched from backend                                                                                                       |
| fetchMore      | function | For [infinite queries](Recipes.md#infinite-queries): <br/> `(options?: { arguments?: TArguments; context?: TContext }) => void` |
| fetchingMore   | boolean  | Is data being fetched with `fetchMore()`?                                                                                       |
| fetchMoreError | Error    | Error that occurs when processing `fetchMore()`                                                                                 |
| refetch        | function | Request latest data from backend <br/> `() => void`                                                                             |
| refetching     | boolean  | Is data being fetched with `refetch()`                                                                                          |
| refetchError   | Error    | Error that occurs when processing `refetch()`                                                                                   |

**Important Note**: `useSuspenseQuery` options object has an extra property named `key`. When you use the same query _simultaneously_ from multiple places in view, make sure to set a unique `key` for each of them.

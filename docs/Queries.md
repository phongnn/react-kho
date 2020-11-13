# Queries

- [Query objects](#query-objects)
- [Data fetching function](#data-fetching-function)
- [Query options](#query-options)
- [Hooks: when to use which?](#hooks-when-to-use-which)
- [useQuery](#usequery)
- [useLazyQuery](#uselazyquery)
- [useSuspenseQuery](#usesuspensequery)

## Query objects

You have to define a query in order to fetch data from backend. The `Query` constructor takes three arguments: a _unique_ name, an _asynchronous_ data fetching function and, optionally, an object for query options:

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

```typescript
import { Query } from "react-kho"
import { getGlobalFeed } from "../api"

const globalFeedQuery = new Query(
  "GlobalFeed",
  (args: { limit: number; offset: number }) =>
    getGlobalFeed(args.limit, args.offset)
)
```

If you use TypeScript, make sure to declare the return type for the underlying data fetching function (`getGlobalFeed()` in the above snippet) to enjoy full benefits of auto-completion when working with hooks.

## Query options

| Option       | Description                                                                                                                                                             | Default value     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| arguments    | Default arguments for the data fetching function.                                                                                                                       | None              |
| context      | Default context value for the data fetching function.                                                                                                                   | None              |
| expiryMs     | Specifies when this query's data expires and needs to be refetched (only if it's still active; it will be removed otherwise)                                            | 900,000 (15 mins) |
| shape        | Specifies how to normalize the query's data. See [Data Normalization](DataNormalization.md).                                                                            | None              |
| fetchPolicy  | `cache-first`, `cache-and-network`, `network-only`                                                                                                                      | `cache-first`     |
| merge        | For [infinite scroll queries](Recipes.md#infinite-scroll-queries)                                                                                                       | None              |
| queryUpdates | Updates other queries based on this query's data. See [recipe](Recipes.md#update-other-queries-based-on-a-query-s-data)                                                 | None              |
| selector     | Only needed when the first request to backend may return blank result AND you want to update this query's data from a related mutation/query. See [gotchas](Gotchas.md) | None              |

## Hooks: when to use which?

Use a suitable hook depending on _when_ you want to fetch data:

- `useQuery`: fetches data when component is mounted (fetch on render). This is what you need in most cases.
- `useLazyQuery`: fetches data on demand.
- `useSuspenseQuery`: render as you fetch, for use with React's Suspense mode.

## useQuery

```typescript
function useQuery(
  query: Query,
  options?: Pick<
    QueryOptions,
    "arguments" | "context" | "expiryMs" | "fetchPolicy"
  >
): DataLoadingState
```

This hook fetches data when component is mounted. It returns an object with the following properties:

| Property       | Type     | Description                                                                                                                                   |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| loading        | boolean  | Is data being fetched?                                                                                                                        |
| data           | any      | Data fetched from backend                                                                                                                     |
| error          | Error    | Error that occurs when trying to fetch data                                                                                                   |
| called         | boolean  | Has the query been called yet?                                                                                                                |
| fetchMore      | function | For [infinite scroll queries](Recipes.md#infinite-scroll-queries): <br/> `(options?: { arguments?: TArguments; context?: TContext }) => void` |
| fetchingMore   | boolean  | Is data being fetched with `fetchMore()`?                                                                                                     |
| fetchMoreError | Error    | Error that occurs when processing `fetchMore()`                                                                                               |
| refetch        | function | Request latest data from backend <br/> `() => void`                                                                                           |
| refetching     | boolean  | Is data being fetched with `refetch()`                                                                                                        |
| refetchError   | Error    | Error that occurs when processing `refetch()`                                                                                                 |
| retry          | function | Retry a _failed_ request <br/> `() => void`                                                                                                   |

## useLazyQuery

```typescript
function useLazyQuery(
  query: Query
): [
  (
    options?: Pick<
      QueryOptions,
      "arguments" | "context" | "expiryMs" | "fetchPolicy"
    >
  ) => void,
  DataLoadingState
]
```

This hook fetches data on demand. It returns a tuple that has two elements:

- A function to call when you want to fetch data.
- An object which represents the data fetching state. It is the same as the object described in [`useQuery`](#usequery)

## useSuspenseQuery

```typescript
function useSuspenseQuery(
  query: Query,
  options?: Pick<
    QueryOptions,
    "arguments" | "context" | "expiryMs" | "fetchPolicy"
  > & { key?: string }
): DataLoadingState
```

This hook allows view to render while data is being fetched. It returns an object with the following properties:

| Property       | Type     | Description                                                                                                                                   |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| data           | any      | Data fetched from backend                                                                                                                     |
| fetchMore      | function | For [infinite scroll queries](Recipes.md#infinite-scroll-queries): <br/> `(options?: { arguments?: TArguments; context?: TContext }) => void` |
| fetchingMore   | boolean  | Is data being fetched with `fetchMore()`?                                                                                                     |
| fetchMoreError | Error    | Error that occurs when processing `fetchMore()`                                                                                               |
| refetch        | function | Request latest data from backend <br/> `() => void`                                                                                           |
| refetching     | boolean  | Is data being fetched with `refetch()`                                                                                                        |
| refetchError   | Error    | Error that occurs when processing `refetch()`                                                                                                 |

Notes:

- This hook requires `Suspense` to work.
- Suspense for data fetching is still an an [experimental feature](https://reactjs.org/docs/concurrent-mode-suspense.html) and not recommended for production.
- `options` has an extra property named `key`. When you use the same query _simultaneously_ from multiple places in view, make sure to set a unique `key` for each of them.

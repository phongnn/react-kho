### Queries

- [Query objects](#query-objects)
- [Data fetching function](#data-fetching-function)
- [Query options](#query-options)
- [Hooks: useQuery, useLazyQuery, and useSuspenseQuery](#hooks-usequery-uselazyquery-and-usesuspensequery)

#### Query objects

You have to define a query in order to fetch data from backend. The `Query` constructor takes three arguments: a _unique_ name, an _asynchronous_ data fetching function and, optionally, an object for query options:

```javascript
import { Query } from "react-kho"
import { getGlobalFeed } from "./api"

const query = new Query("GlobalFeed", getGlobalFeed, {
  shape: {
    articles: [ArticleType],
  },
})
```

#### Data fetching function

This function should return a promise or use the `async` keyword. It accepts as optional inputs two _plain_ JavaScript objects:

- `args` contains the arguments required for data fetching.
- `context` can be used to pass access token or metadata such as HTTP request headers.

```typescript
import { Query } from "react-kho"
import { getGlobalFeed } from "../api"

export const globalFeedQuery = new Query(
  "GlobalFeed",
  (args: { limit: number; offset: number }) =>
    getGlobalFeed(args.limit, args.offset)
)
```

If you use TypeScript, make sure to declare the return type for the underlying data fetching function (`getGlobalFeed()` in the above snippet) to enjoy the full benefit of auto-completion when working with hooks.

#### Query options

| Option       | Required | Description                                                                                                                                                             | Default value     |
| ------------ | :------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| arguments    |    N     | Default arguments for data fetching function.                                                                                                                           | None              |
| context      |    N     | Default context value for data fetching function.                                                                                                                       | None              |
| expiryMs     |    N     | Specifies when this query's data expires and needs to be refetched (only if it's still active; it will be removed otherwise)                                            | 900,000 (15 mins) |
| shape        |    N     | Specifies how to normalize the query's data. See [Data Normalization](DataNormalization.md).                                                                            | None              |
| fetchPolicy  |    N     | `cache-first`, `cache-and-network`, `network-only`                                                                                                                      | `cache-first`     |
| merge        |    N     | For [infinite scroll queries](Recipes.md#infinite-scroll-queries)                                                                                                       | None              |
| queryUpdates |    N     | Updates other queries based on this query's data. See [recipe](Recipes.md#update-other-queries-based-on-a-query-s-data)                                                 | None              |
| selector     |    N     | only needed when the first request to backend may return blank result AND you want to update this query's data from a related mutation/query. See [gotchas](Gotchas.md) | None              |

#### Hooks: useQuery, useLazyQuery, and useSuspenseQuery

Use a suitable hook depending on _when_ you want to fetch data:

- `useQuery`: fetches data when component is mounted (fetch on render). This is what you need in most cases.
- `useLazyQuery`: fetches data on demand.
- `useSuspenseQuery`: render as you fetch, for used only with React's Suspense mode.

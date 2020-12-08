# Recipes

- [Paginated queries](#paginated-queries)
- [Infinite queries](#infinite-queries)
- [Updating other queries based on a query's data](#updating-other-queries-based-on-a-querys-data)
- [Mutations with optimistic response](#mutations-with-optimistic-response)
- [Transforming data when reading from cache](#transforming-data-when-reading-from-cache)

## Paginated queries

There's nothing really special about a paginated query. It's a normal query that can have multiple instances, each with a different set of arguments.

```javascript
export default function MyComponent() {
  const [pageIndex, setPageIndex] = useState(0)
  const { loading, data } = useQuery(feedQuery, {
    arguments: { limit: PAGE_SIZE, offset: pageIndex * PAGE_SIZE },
  })

  if (loading) {
    return <p>Loading...</p>
  } else if (!data) {
    return null
  }

  const { articles, articlesCount } = data
  const pagesCount = Math.ceil(articlesCount / PAGE_SIZE)
  return (
    <div>
      <ArticleList articles={articles} />
      <PaginationNav
        pagesCount={pagesCount}
        currentPageIndex={pageIndex}
        onPageSelect={setPageIndex}
      />
    </div>
  )
}
```

[View example on CodeSandbox.](https://codesandbox.io/s/react-kho-paginated-query-6ibfo)

When you want to refetch a paginated query (usually from a mutation's `afterQueryUpdates()`), you can provide the exact arguments of a particular page, or you can provide partial arguments or none at all:

```javascript
// refetch first page only, exact arguments
store.refetchQueries([feedQuery.withOptions({ limit: PAGE_SIZE, offset: 0 })])
```

```javascript
// refetch first page only, partial arguments
store.refetchQueries([feedQuery.withOptions({ offset: 0 })])
```

```javascript
// refetch ALL pages as no arguments are specified
store.refetchQueries([feedQuery])
```

<br/>

## Infinite queries

An infinite query is a query with a `merge()` function that merges existing data with new data when `fetchMore()` happens.

```javascript
import { Query } from "react-kho"
import { getFeed } from "../api"
import { ArticleType } from "./normalizedTypes"

const feedQuery = new Query(
  "InfiniteFeed",
  (args) => getFeed(args.limit, args.offset),
  {
    shape: {
      articles: [ArticleType],
    },
    merge: (existingData, newData) => {
      const { articles, hasMore } = newData
      return {
        articles: [...existingData.articles, ...articles],
        hasMore,
      }
    },
  }
)
```

`merge()` has the following three arguments:

- `existingData`: query's existing data in _normalized_ format.
- `newData`: data newly fetched, also in _normalized_ format.
- `info`: an object with a property named `arguments` containing the arguments of the new request.

Now you can use `fetchMore()` from views like so:

```javascript
import { useQuery } from "react-kho"
import { feedQuery } from "../store"

function MyComponent() {
  const { fetchMore, data } = useQuery(feedQuery, {
    arguments: { limit: 20, offset: 0 },
  })

  return !data ? null : (
    <div>
      <ul>
        {data.articles.map(({ slug, title }) => (
          <li key={slug}>{title}</li>
        ))}
      </ul>
      <div>
        <button
          disabled={!data.hasMore}
          onClick={() =>
            fetchMore({
              arguments: { limit: 20, offset: data.articles.length },
            })
          }
        >
          More
        </button>
      </div>
    </div>
  )
}
```

When calling `fetchMore()`, you can pass an object with two optional properties: `arguments` and `context`.

[View example on CodeSandbox.](https://codesandbox.io/s/react-kho-infinite-query-7qmuh)

<br/>

## Updating other queries based on a query's data

When fetching a query's data, there are times you might want to update some related queries. To do that, you can use query's `queryUpdates` option.

`queryUpdates` is an object with keys being **query names**, and values being functions of the following signature:

```typescript
;(
  currentValue: any,
  info: {
    queryArgs: any
    relatedQueryResult: any
    relatedQueryArgs: any
  }
) => any
```

Where:

- `currentValue`: existing data in _normalized_ format of the query to be updated.
- `info`: an object with the following properties:
  - `queryArgs`: an object containing the arguments of the query to be updated.
  - `relatedQueryResult`: the current query's result in _normalized_ format.
  - `relatedQueryArgs`: an object containing the current query's arguments.

The return value of this function will replace the query's current value in cache. Note that the function will not be called for queries not already in cache.

**Example**:

When fetching data for a paginated query, update `articlesCount` in all pages:

```javascript
const feedQuery = new Query(
  "InfiniteFeed",
  (args) => getFeed(args.limit, args.offset),
  {
    shape: {
      articles: [ArticleType],
    },
    queryUpdates: {
      InfiniteFeed: (
        currentValue,
        { queryArgs, relatedQueryArgs, relatedQueryResult }
      ) => {
        return queryArgs.offset === relatedQueryArgs.offset
          ? currentValue
          : {
              ...currentValue,
              articlesCount: relatedQueryResult.articlesCount,
            }
      },
    },
  }
)
```

[View example on CodeSandbox.](https://codesandbox.io/s/react-kho-query-updates-38nb3)

<br/>

## Mutations with optimistic response

Optimistic response can improve the perceived performance by showing temporary result immediately and replacing it when actual result becomes available.

You can specify `optimisticResponse` when calling the function to mutate data:

```javascript
function UserForm() {
  const [addUser] = useMutation(addUserMutation)
  const handleSubmit = () => {
    const user = {
      /* something */
    }
    addUser({
      arguments: { user },
      optimisticResponse: user,
    })
  }
}
```

Note that when you use `optimisticResponse`, the mutation's `queryUpdates()`, `beforeQueryUpdates()` and `afterQueryUpdates()` will be called twice, first with the optimistic response then again with the actual response.

```javascript
const addUserMutation = new Mutation("AddUser", (args) => addUser(args.user), {
  resultShape: UserType,
  queryUpdates: {
    UserList: (currentValue, { mutationResult: newUserRef, optimistic }) => {
      return optimistic ? [...currentValue, newUserRef] : currentValue
    },
  },
})
```

[View example on CodeSandbox.](https://codesandbox.io/s/react-kho-optimistic-response-5wmgf)

<br/>

## Transforming data when reading from cache

When registering a normalized type, you can define functions to transform its properties when data is read from cache like so:

```javascript
const OrderType = NormalizedType.register("Order", {
  transform: {
    createdAt: (val) => new Date(val),
    updatedAt: (val) => new Date(val),
    shippingAddress: (val) => val.toUpperCase(),
  },
})
```

<br/>

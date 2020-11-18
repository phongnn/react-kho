# Recipes

- [Infinite queries](#infinite-queries)
- [Updating other queries based on a query's data](#updating-other-queries-based-on-a-querys-data)
- [Mutations with optimistic response](#mutations-with-optimistic-response)

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

## Updating other queries based on a query's data

## Mutations with optimistic response

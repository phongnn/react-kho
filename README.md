<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/react-kho">
    <img alt="" src="https://badgen.net/npm/v/react-kho">
  </a>
  <a aria-label="Package size" href="https://bundlephobia.com/result?p=react-kho">
    <img alt="" src="https://badgen.net/bundlephobia/minzip/react-kho">
  </a>
  <a aria-label="License" href="https://github.com/phongnn/react-kho/blob/master/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/react-kho">
  </a>
</p>

A state management library which _fetches_, **_normalizes_**, and _caches_ data for your React application.

## Features

What makes _react-kho_ different from other data fetching libraries is that it **normalizes** data in the cache. Which means when some objects change, all the related queries will be updated automatically without you having to do anything.

- Transport and protocol agnostic data fetching
- Data normalization
- Request deduplication
- Interval polling
- Paginated queries
- Infinite scroll queries
- Local state
- Mutations with query revalidation
- Local mutations (e.g. for use with WebSocket or SSE)
- Cache reset and query revalidation (e.g. upon user sign in/out)
- TypeScript support
- SSR support
- React Suspense support
- DevTools (coming soon)
- ...

<br/>

## Usage

Inside your React project directory, run `npm install react-kho` or `yarn add react-kho`.

<br/>

## In a Nutshell

Let's say you're working on a blog application that allows users to post articles and comments.

First, register these types like so:

```typescript
// store/types.ts
import { NormalizedType as Type } from "react-kho"

export const UserType = Type.register("User", { keyFields: ["username"] })

export const CommentType = Type.register("Comment", {
  shape: { author: UserType },
}) // key field is "id" by default

export const ArticleType = Type.register("Article", {
  keyFields: ["slug"],
  shape: {
    author: UserType,
    comments: [CommentType],
  },
})
```

Next, define your query object:

```typescript
// store/queries.ts
import { Query } from "react-kho"
import { ArticleType } from "./types"
import { getGlobalFeed } from "../api"

export const globalFeedQuery = new Query(
  "GlobalFeed",
  (args: { limit: number; offset: number }) =>
    getGlobalFeed(args.limit, args.offset),
  {
    shape: { articles: [ArticleType] },
  }
)
```

You can then use the query from your UI:

```typescript
// views/Home/index.tsx
import { useQuery } from "react-kho"
import { globalFeedQuery } from "../../store"

function GlobalFeed() {
  const { loading, data, error } = useQuery(globalFeedQuery, {
    arguments: { limit: 10, offset: 0 },
  })

  if (loading) {
    return <p>Loading...</p>
  } else if (error) {
    return <p>{error.message}</p>
  } else if (data) {
    const { articlesCount, articles } = data
    return articlesCount === 0 ? (
      <p>No articles found.</p>
    ) : (
      <ArticleList articles={articles} />
    )
  }
  return null
}
```

```typescript
// index.tsx
import { Provider, createStore } from "react-kho"

ReactDOM.render(
  <Provider store={createStore()}>
    <App />
  </Provider>
)
```

Now if you need to update an article, define a mutation object:

```typescript
// store/mutations/articles.ts
import { Mutation } from "react-kho"
import { ArticleType } from "../types"
import { updateArticle } from "../../api"

export const updateArticleMutation = new Mutation(
  "UpdateArticle",
  (args: { slug: string; input: any }) => updateArticle(args.slug, args.input),
  {
    resultShape: ArticleType, // updateArticle() should return Promise<Article>
  }
)
```

And use the mutation from the UI:

```typescript
// views/EditArticle/index.tsx
import { useHistory, useParams } from "react-router-dom"
import { useMutation } from "react-kho"
import { updateArticleMutation } from "../../store"

function EditArticle() {
  const { slug } = useParams<{ slug: string }>()
  const browserHistory = useHistory()
  const [updateArticle, { loading, error, data, called }] = useMutation(
    updateArticleMutation
  )

  useEffect(() => {
    if (called && !error) {
      browserHistory.push(`/articles/${slug}`)
    }
  }, [slug, called, error])

  if (loading) {
    return <p>Loading...</p>
  } else if (error) {
    return <p>{error.message}</p>
  } else {
    return (
      <ArticleForm
        slug={slug}
        onSubmit={(input: any) => updateArticle({ arguments: { slug, input } })}
      />
    )
  }
}
```

The good thing about `react-kho` is that all the related queries will be updated automatically.

<br/>

## Learn More

- [Concepts & Guides](docs#concepts-guides)
- [Examples](docs#examples)
- [Real world demo](https://github.com/phongnn/react-kho-realworld-demo) (Conduit frontend)
- DevTools (Coming soon)

<br/>

## License

The MIT License.

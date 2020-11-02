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

React hooks for a [Kho](https://github.com/phongnn/kho) store which _fetches_, **_normalizes_**, and _caches_ data for your application.

### Features

What makes _react-kho_ different from other data fetching libraries is that it **normalizes** data in the cache. That means when some objects are updated, the changes will automatically reflect in all the related queries without you having to do anything.

- Transport and protocol agnostic data fetching
- Data normalization
- Request deduplication
- Interval polling
- Paginated queries
- Infinite scroll queries
- Local state
- Mutations with query revalidation
- Local mutations for use with WebSocket or SSE
- Cache reset and query revalidation upon user sign in/out
- TypeScript support
- SSR support
- React Suspense support
- DevTools (coming soon)
- ...

<br/>

## Quick Start

```js
import { Query } from "react-kho"

// use REST, GraphQL or any async function
export const articleQuery = new Query("Article", (args) =>
  getArticle(args.slug)
)
```

```js
import { useQuery } from "react-kho"
import { articleQuery } from "./store.js"

function ArticleView() {
  const { loading, data, error } = useQuery(articleQuery)
  if (loading) return <div>loading...</div>
  if (error) return <div>{error.message}</div>
  return <div>{data.title}</div>
}
```

<br/>

## Usage

Inside your React project directory, run the following:

```
yarn add react-kho
```

Or with npm:

```
npm install react-kho
```

<br/>

## Documentation

<br/>

## API Reference

<br/>

## License

The MIT License.

# Store API

## `query`

Fetches data, saves into cache, and returns query's result. It won't call backend if data is already available in cache.

```javascript
const data = await store.query(globalFeedQuery, {
  arguments: { limit: 10, offset: 20 },
})
```

`query()` takes two arguments: the query object and, optionally, an object that allows setting/overriding some options: `arguments`, `context`, and `fetchPolicy`.

<br/>

## `mutate`

Calls backend to mutate data, updates cache, and returns mutation's result.

```javascript
const article = await store.mutate(createArticleMutation, {
  arguments: { input },
})
```

`mutate()` takes two arguments: the mutation object and, optionally, an object that allows setting/overriding some options: `arguments`, `context`, `optimisticResponse` and `syncMode`.

<br/>

## `mutateLocal`

Updates cache using a local mutation.

```javascript
await store.mutateLocal(aLocalMutation, {
  input: dataFromServer,
})
```

`mutateLocal()` takes two arguments: the local mutation object and, optionally, an object that allows specifying `input` and `syncMode`.

<br/>

## `getQueryData`

Retrieves query/local query's data from cache. This method is synchronous and doesn't call backend if data is not available.

```javascript
const user = store.getQueryData(signedInUserQuery)
```

If a query has multiple instances with different arguments (e.g., a paginated query), you can retrieve data for a specific instance like so:

```javascript
const page3 = store.getQueryData(
  globalFeedQuery.withOptions({ arguments: { limit: 10, offset: 20 } })
)
```

<br/>

## `setQueryData`

Stores a query/local query into cache. Data will be normalized if you've defined a shape for that query.

```javascript
store.setQueryData(aQuery, someData)
```

<br/>

## `refetchQueries`

Refetches queries from backend and saves into cache.

```javascript
await store.refetchQueries([
  articleQuery.withOptions({ arguments: { slug } }),
  globalFeedQuery,
])
```

**Notes**:

- When query arguments are not provided or partially provided, all the matching instances in the cache will be processed.
- Only the queries that are currently active will be refetched. Inactive queries will be _removed_ from cache and refetched only when they become active later.
- `refetchQueries()` does _not_ have any return value.

<br/>

## `refetchActiveQueries`

Refetches actives queries from backend and saves into cache. This could be useful for scenarios such as window re-focus or network re-connected.

```javascript
await store.refetchActiveQueries()
```

<br/>

## `clearStore`

Clears cache, resets local queries to their initial values, then refetches remote _active_ queries.

```javascript
await store.resetStore()
```

<br/>

## `getState`

Usually used for server-side rendering (SSR), this method returns an object tree that represents the current state of the store.

```javascript
const state = store.getState()

// restoring the state later at client-side
const store = createStore({ preloadedState })
```

<br/>

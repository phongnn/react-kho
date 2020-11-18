# Mutations

A mutation represents a request to update data at backend. If you want to update data in client-side cache only, use a [local mutation](LocalMutations.md) instead.

- [Mutation objects](#mutation-objects)
- [Mutation function](#mutation-function)
- [Updating client-side cache](#updating-client-side-cache)
- [Other mutation options](#other-mutation-options)
- [`useMutation` hook](#usemutation-hook)

## Mutation objects

The `Mutation` constructor takes three arguments: a unique name, an _asynchronous_ mutation function and, optionally, an object for mutation options:

```javascript
import { Mutation } from "react-kho"
import { updateArticle } from "../api"
import { ArticleType } from "./normalizedTypes"

const mutation = new Mutation("UpdateArticle", updateArticle, {
  resultShape: ArticleType,
})
```

## Mutation function

This function should return a promise or use the `async` keyword. It accepts as optional inputs three objects:

- `args`: a _plain_ JavaScript object which contains the arguments required for data update.
- `context`: a _plain_ JavaScript which can be used for passing metadata such as HTTP request headers.
- `store`: reference to the Kho store which can be used for retrieving queries' data in cache. See [Store API](StoreAPI.md).

```javascript
import { Mutation } from "react-kho"
import { updateArticle } from "../api"
import { ArticleType } from "./normalizedTypes"

const updateArticleMutation = new Mutation(
  "UpdateArticle",
  (args, ctx) => updateArticle(args.slug, args.input),
  {
    resultShape: ArticleType,
  }
)
```

If you use TypeScript, make sure to declare the return type for the underlying data updating function (`updateArticle()` in the above snippet) to enjoy full benefits of auto-completion.

## Updating client-side cache

There are four options for updating cache after a successful mutation request:

- [`resultShape`](#resultshape): automatically parses the mutation's result and updates normalized objects.
- [`queryUpdates`](#queryupdates): updates related queries' data.
- [`beforeQueryUpdates`](#beforequeryupdates): usually used for deleting or updating normalized objects in cache.
- [`afterQueryUpdates`](#afterqueryupdates): refetches related queries, resets store (e.g. after user sign in/out), etc.

### `resultShape`

If you define `resultShape`, Kho will normalize the returned value of the mutation function, and automatically update the relevant normalized objects in the cache. For how to define `resultShape`, see [Data normalization](DataNormalization.md).

### `queryUpdates`

When a mutation adds some new objects, Kho by itself doesn't know how to update the existing queries in the cache accordingly. For this, you have two options:

- Refetch related queries from backend: see [`afterQueryUpdates`](#afterqueryupdates); OR
- Use `queryUpdates` option to specify how to update the related queries based on their exising data and the current mutation's result.

`queryUpdates` is an object with keys being **query names**, and values being functions of the following signature:

```typescript
;(
  currentValue: any,
  info: {
    mutationResult: any
    mutationArgs: any
    optimistic: boolean
    queryArgs: any
  }
) => any
```

Where:

- `currentValue`: the query's existing data in _normalized_ format.
- `info`: an object with the following properties:
  - `mutationResult`: the current mutation's result in _normalized_ format.
  - `mutationArgs`: an object containing the current mutation's arguments.
  - `queryArgs`: an object containing the query's arguments.
  - `optimistic`: indicates if `mutationResult` is an [optimistic response](Recipes.md#mutations-with-optimistic-response).

The return value of this function will replace the query's current value in cache. Note that the function will not be called for queries not already in cache.

**Example**:

Updating a query named "GlobalFeed" after adding a new article:

```javascript
const addArticleMutation = new Mutation(
  "AddArticle",
  (args) => addArticle(args.input),
  {
    resultShape: ArticleType,
    queryUpdates: {
      GlobalFeed: (
        currentValue,
        { queryArgs: { offset }, mutationResult: newArticleRef }
      ) => {
        if (offset > 0) {
          // ignore if not the first page
          return currentValue
        } else {
          return [newArticleRef, ...currentValue] // add new article to top of the page
        }
      },
    },
  }
)
```

### `beforeQueryUpdates`

`beforeQueryUpdates` is a function that will be called prior to the `queryUpdates` option being processed. It is usually needed in the following situations:

- The mutation deletes some data at backend and you want to delete the objects from the cache too.
- You want to update a normalized object which can't be updated automatically (see example below).

**`beforeQueryUpdates` signature**:

```typescript
  beforeQueryUpdates: (
    cache: CacheProxy,
    info: {
      mutationResult: any
      mutationArgs: any
      optimistic: boolean
    }
  ) => void
```

Where:

- `cache`: a proxy to the Kho store's cache. See API below.
- `info`: an object with the following properties:
  - `mutationResult`: the current mutation's result in _normalized_ format.
  - `mutationArgs`: an object containing the current mutation's arguments.
  - `optimistic`: indicates if `mutationResult` is an [optimistic response](Recipes.md#mutations-with-optimistic-response).

**Cache proxy's API**

The cache proxy object provides the following methods:

| Method                                                               | Description                                                                                                                                                     |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `findObjectRef(type: NormalizedType, key: any): NormalizedObjectRef` | Returns a reference object which points to an object in the cache. Returns null if not found. <br/>`key` can be a primitive value or a plain JavaScript object. |
| `readObject(ref: NormalizedObjectRef): any`                          | Returns cached object in _normalized_ format                                                                                                                    |
| `updateObject(ref: NormalizedObjectRef, data: any): void`            | Replaces object in cache. Note: `data` must be in _normalized_ format.                                                                                          |
| `deleteObject(ref: NormalizedObjectRef): void`                       | Removes object from cache                                                                                                                                       |
| `addObject(type: NormalizedType, data: any): NormalizedObjectRef`    | Add a new _normalized_ object to cache                                                                                                                          |
| `readQuery(query: Query): any`                                       | Returns cached query in _normalized_ format                                                                                                                     |

**Example**:

When a comment is created, update the relevant article by adding the new comment to its list of comments:

```javascript
const createCommentMutation = new Mutation(
  "CreateComment",
  (args) => createComment(args.slug, { body: args.comment }),
  {
    resultShape: CommentType,
    beforeQueryUpdates: (
      cache,
      { mutationArgs: { slug }, mutationResult: commentRef }
    ) {
      const articleRef = cache.findObjectRef(ArticleType, slug)!
      const article = cache.readObject(articleRef)
      cache.updateObject(articleRef, {
        ...article,
        comments: [...(article.comments || []), commentRef],
      })
    },
  }
)
```

### `afterQueryUpdates`

`afterQueryUpdates` is a function that will be called when `queryUpdates` has just finished. This function can be used, for example, to refetch related queries from backend or to reset the store after user signing in/out.

**`afterQueryUpdates` signature**:

```typescript
  afterQueryUpdates: (
    store: Store,
    info: {
      mutationResult: any
      mutationArgs: any
      optimistic: boolean
    }
  ) => void | Promise<any>
```

Where:

- `store`: reference to the Kho store. See [Store API](StoreAPI.md).
- `info`: an object with the following properties:
  - `mutationResult`: the current mutation's result as returned by the mutation function, _not_ in normalized format.
  - `mutationArgs`: an object containing the current mutation's arguments.
  - `optimistic`: indicates if `mutationResult` is an [optimistic response](Recipes.md#mutations-with-optimistic-response).

**Example**:

```javascript
const followUserMutation = new Mutation(
  "FollowUser",
  (args) => followUser(args.username),
  {
    afterQueryUpdates: (store) => store.refetchQueries([yourFeedQuery]),
  }
)
```

## Other mutation options

Below are the other options beside [`resultShape`](#resultshape), [`queryUpdates`](#queryupdates), [`beforeQueryUpdates`](#beforequeryupdates) and [`afterQueryUpdates`](#afterqueryupdates):

| Option             | Description                                                                           | Default value |
| ------------------ | ------------------------------------------------------------------------------------- | ------------- |
| arguments          | Default arguments for the mutation function                                           | None          |
| context            | Default context value for the mutation function                                       | None          |
| optimisticResponse | [Optimistic response](Recipes.md#mutations-with-optimistic-response) for the mutation | None          |
| syncMode           | If set to `true`, the mutation only completes when `afterQueryUpdates` has finished   | False         |

## useMutation hook

This hook returns a function to call when you want to send the mutation request, and an object which represents the mutation's state.

```javascript
import { useMutation } from "react-kho"

export function ArticleView() {
  const [followUser, { loading, called, error }] = useMutation(followUserMutation)

  useEffect(() => {
    if (called && !error) {
      // show a toast
    }
  }, [called, error])

  return (
    <div>
      <button onClick={() => followUser({ arguments: { username } })}>Follow</button>
    </div>
  )
```

When calling the function to mutate data, you can provide an object to specify/override some options: `arguments`, `context`, `optimisticResponse`, and `syncMode`.

The object representing mutation state has the following properties:

| Property | Type    | Description                                             |
| -------- | ------- | ------------------------------------------------------- |
| loading  | boolean | Is the mutation in progress?                            |
| data     | any     | Return value from backend                               |
| error    | Error   | Error that occurs during the processing of the mutation |
| called   | boolean | Has the mutation completed yet?                         |

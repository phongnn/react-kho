# Local Queries

Simply put, a local query is a query without a data fetching function. You can use it to handle client state, for example, information of the currently signed in user.

## Local query objects

The `LocalQuery` constructor takes two arguments: a _unique_ name and an object for query options:

```javascript
import { LocalQuery } from "react-kho"
import { UserType } from "./normalizedTypes"

const signedInUserQuery = new LocalQuery("SignedInUser", {
  shape: UserType,
  initialValue: null,
})
```

If you're using TypeScript, do it like so to enjoy the benefit of auto-completion:

```typescript
const signedInUserQuery = new LocalQuery<User | null>(...)
```

## Using a local query's data from views

`useLocalQuery` hook allows views to access the local query's data:

```javascript
function MyComponent {
  const { data: { name, email } } = useLocalQuery(signedInUserQuery)
  return <p>Hello, {name}!</p>
}
```

## Updating a local query's data

There are generally two options for updating a local query's data:

- Use `queryUpdates` option from related queries and/or mutations.
- Use [Store's `setQueryData` method](StoreAPI.md#setquerydata) as in the following example:

```javascript
const signInMutation = new Mutation("SignIn", signIn, {
  resultShape: { user: UserType },
  afterQueryUpdates: (store, { mutationResult: { user, token } }) => {
    saveAccessToken(token)
    store.setQueryData(signedInUserQuery, user)
  },
})
```

## Local query options

| Option       | Description                                                                                                              | Default value |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------- |
| initialValue | The initial value in _non-normalized_ format                                                                             | None          |
| shape        | Specifies how to normalize the query's data. See [Data Normalization](DataNormalization.md)                              | None          |
| queryUpdates | Updates other queries based on this query's data. See [recipe](Recipes.md#updating-other-queries-based-on-a-querys-data) | None          |

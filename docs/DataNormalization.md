### Data Normalization

- [What is data normalization?](#what-is-data-normalization)
- [Is data normalization mandatory?](#is-data-normalization-mandatory)
- [How to use data normalization with Kho?](#how-to-use-data-normalization-with-kho)

#### What is data normalization?

Backends usually return data that is nested. For example, we may have users and comments inside an article's data like so:

```json
{
  "slug": "article-1",
  "title": "an example",
  "author": {
    "username": "x",
    "avatar": "x.png"
  },
  "body": "blah...",
  "comments": [
    { "id": 1, "body": "...", "user": { "username": "y", "avatar": "y.png" } },
    { "id": 2, "body": "...", "user": { "username": "x", "avatar": "x.png" } }
  ]
}
```

If we store the data as it is into our client-side cache, we may have problems with data updates. In the example above, when we want to change a user's avatar, we will have to find and update it in multiple places.
That's rather inconvenient and prone to errors.

Data normalization process moves nested objects out and replaces them with references. This way, each object has only a single copy in the cache, and thus can be easily updated. The article above looks somewhat like this after being normalized:

```json
{
  "slug": "article-1",
  "title": "an example",
  "author": ref("User", "x"),
  "body": "blah...",
  "comments": [ref("Comment", 1), ref("Comment", 2)]
}
```

#### Is data normalization mandatory?

No. With Kho, you can normalize some queries while keeping the others as is.

#### How to use data normalization with Kho?

You have to register normalized types then use them to define the shape of your queries/mutation results.

**Registering normalized types**

It could be as simple as this:

```javascript
import { NormalizedType } from "react-kho"

const UserType = NormalizedType.register("User")
```

Kho requires every normalized object to contain key field(s), named `id` by default, uniquely identifying that object. You can configure the key fields like so:

```javascript
const UserType = NormalizedType.register("User", { keyFields: ["username"] })

const OrderItemType = NormalizedType.register("OrderItem", {
  keyFields: ["orderId", "productId"],
})
```

If your normalized type contains other types' data, you will need to define its shape (so that Kho knows how to parse it):

```javascript
const ArticleType = NormalizedType.register("Article", {
  shape: {
    author: UserType,
    comments: [CommentType],
  },
})
```

**Defining a query/mutation's shape**

After registering normalized types, you can use them to define the shape of a query's data or a mutation's result.

For example, if you have a query that returns data in the following format:

```json
{
  "articlesCount": 53,
  "hasNext": true,
  "articles": [
      { ... },
      { ... },
  ]
}
```

You can define it like so:

```javascript
import { Query } from "react-kho"
import { getGlobalFeed } from "./api"

const query = new Query("GlobalFeed", getGlobalFeed, {
  shape: {
    articles: [ArticleType],
  },
})
```

Notice that in the query above, `articlesCount` and `hasNext` don't need to be normalized, only `articles` does.

<br/>

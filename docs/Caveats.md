# Caveats

Below are a few important things to note when using react-kho:

**Objects must always include keys:**

react-kho relies on object keys to normalize data, so make sure objects in query/mutation results always contain key values.

**Query's selector:**

Normally, react-kho automatically infers a query's structure based on the data returned by backend. However, if your query might return empty result on the initial request **AND** you wish to alter the query's data using `queryUpdates` or `afterQueryUpdates` options, you will have to use the `selector` option to explicitly specify the query's structure.

A selector is simply an array of which each element is either:

- a string specifying a field name, or
- a 2-element array where the first element is a field name (i.e., a string) and the second element is sub-selector (i.e., an array)

```typescript
type Selector = Array<string | [string, Selector]>
```

For example, if your query's data looks like this:

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

Then you can define the query like so:

```javascript
const query = new Query("Article", getArticle, {
  selector: [
    "slug",
    "title",
    "body",
    ["author", ["username", "avatar"]],
    ["comments, [
      "id",
      "body",
      ["user", ["username", "avatar"]]
    ]
  ]
})
```

<br/>

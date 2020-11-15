# Creating Kho Store

To start using _react-kho_, you need to create a store and provide it to a `Provider` component at the top of your component tree:

```javascript
import { Provider, createStore } from "react-kho"

ReactDOM.render(
  <Provider store={createStore()}>
    <App />
  </Provider>,
  document.getElementById("root")
)
```

`createStore()` accepts an object that allows you to specify the following options:

| Option         | Description                                                                                              | Default value     |
| -------------- | -------------------------------------------------------------------------------------------------------- | ----------------- |
| queryExpiryMs  | Default value for queries' `expiryMs` which determines when it expires and needs refetching from backend | 900,000 (15 mins) |
| preloadedState | Usually used for server-side rendering (SSR) to restore the Kho store                                    | None              |

See [Store API](StoreAPI.md) for how to use Store's methods.

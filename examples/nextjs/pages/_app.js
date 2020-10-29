import { createStore, Provider } from "react-kho";

const isServer = typeof window === "undefined";
let clientStore;

export default function App({ Component, pageProps }) {
  const { preloadedState, ...rest } = pageProps || {};
  if (isServer) {
    const store = createStore({ preloadedState });
    return (
      <Provider store={store}>
        <Component {...rest} />
      </Provider>
    );
  } else {
    if (clientStore === undefined) {
      clientStore = createStore({ preloadedState });
    }
    return (
      <Provider store={clientStore}>
        <Component {...rest} />
      </Provider>
    );
  }
}

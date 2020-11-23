import * as React from "react";
import { render } from "react-dom";
import { Provider, createStore } from "react-kho";

import App from "./App";

const rootElement = document.getElementById("root");
render(
  <Provider store={createStore()}>
    <App />
  </Provider>,
  rootElement
);

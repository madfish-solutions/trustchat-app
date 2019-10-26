import "./index.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ServiceWorker from "./serviceWorker";

// In DEV env We need React HMR
// And don't need custom Error Boundary, CRA already do this
const App =
  process.env.NODE_ENV === "development"
    ? require("app/HotApp").default
    : require("app/ErrorBoundedApp").default;

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
ServiceWorker.unregister();

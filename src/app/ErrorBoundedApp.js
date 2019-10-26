import * as React from "react";
import ErrorBoundary from "./App/ErrorBoundary";
import App from "./App";

const ErrorBoundedApp = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default ErrorBoundedApp;

import * as React from "react";
import useTronWebContext from "lib/tron/useTronWebContext";
import EnsureTronWeb from "lib/tron/EnsureTronWeb";
import Page from "app/page/Page";

const App = () => (
  <useTronWebContext.Provider>
    <EnsureTronWeb>
      <React.Suspense fallback={null}>
        <Page />
      </React.Suspense>
    </EnsureTronWeb>
  </useTronWebContext.Provider>
);

export default App;

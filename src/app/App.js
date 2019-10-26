import * as React from "react";
import useTronWebContext from "lib/tron/useTronWebContext";
import EnsureTronWeb from "lib/tron/EnsureTronWeb";
import useContractContext from "app/tron/useContractContext";
import Page from "app/page/Page";

const App = () => (
  <useTronWebContext.Provider>
    <EnsureTronWeb>
      <useContractContext.Provider>
        <React.Suspense fallback={null}>
          <Page />
        </React.Suspense>
      </useContractContext.Provider>
    </EnsureTronWeb>
  </useTronWebContext.Provider>
);

export default App;

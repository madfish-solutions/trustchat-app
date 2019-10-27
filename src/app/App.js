import * as React from "react";
import useTronWebContext from "lib/tron/useTronWebContext";
import EnsureTronWeb from "lib/tron/EnsureTronWeb";
import DisableOutlinesForClick from "lib/a11y/DisableOutlinesForClick";
import useTrustchatContext from "app/trustchat/useTrustchatContext";
import EnsureTrustchat from "app/trustchat/EnsureTrustchat";
import Page from "app/page/Page";

const App = () => (
  <>
    <useTronWebContext.Provider>
      <EnsureTronWeb>
        <useTrustchatContext.Provider>
          <EnsureTrustchat>
            <React.Suspense fallback={null}>
              <Page />
            </React.Suspense>
          </EnsureTrustchat>
        </useTrustchatContext.Provider>
      </EnsureTronWeb>
    </useTronWebContext.Provider>

    <DisableOutlinesForClick />
  </>
);

export default App;

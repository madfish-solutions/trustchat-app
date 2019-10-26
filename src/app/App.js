import * as React from "react";
import Chat from "app/chat/Chat";
import useTronWebContext from "lib/useTronWebContext";

const App = () => (
  <useTronWebContext.Provider>
    <Chat />
  </useTronWebContext.Provider>
);

export default App;

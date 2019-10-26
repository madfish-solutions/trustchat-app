import * as React from "react";
import useTronWebContext from "lib/tron/useTronWebContext";
import InstallTRONGuide from "app/tron/InstallTRONGuide";

export default function restrictWithTronWeb(Component) {
  return props => {
    const { ready } = useTronWebContext();
    return ready ? <Component {...props} /> : <InstallTRONGuide />;
  };
}

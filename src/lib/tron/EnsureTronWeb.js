import * as React from "react";
import useTronWebContext from "lib/tron/useTronWebContext";

const EnsureTronWeb = ({ children, fallback = null }) => {
  const { initialized } = useTronWebContext();

  return initialized ? <>{children}</> : fallback;
};

export default EnsureTronWeb;

import * as React from "react";
import useTrustchatContext from "app/trustchat/useTrustchatContext";

const EnsureTrustchat = ({ children, fallback = null }) => {
  const { initialized } = useTrustchatContext();

  return initialized ? <>{children}</> : fallback;
};

export default EnsureTrustchat;

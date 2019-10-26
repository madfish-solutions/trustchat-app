import * as React from "react";
import classNames from "clsx";

const ContentContainer = ({ as: Component = "div", className, ...rest }) => (
  <Component
    className={classNames("w-full max-w-xl mx-auto", className)}
    {...rest}
  />
);

export default ContentContainer;

const {
  override,
  addPostcssPlugins,
  addBabelPlugin,
  addWebpackAlias
} = require("customize-cra");

const { NODE_ENV } = process.env;

module.exports = override(
  // Styling
  addPostcssPlugins(
    [
      require("tailwindcss"),
      NODE_ENV === "production" && require("@fullhuman/postcss-purgecss")()
    ].filter(Boolean)
  ),

  // React Hot Loader
  NODE_ENV === "development" &&
    override([
      addBabelPlugin("react-hot-loader/babel"),
      addWebpackAlias({
        "react-dom": "@hot-loader/react-dom"
      })
    ])

  // Preact compat
  // NODE_ENV === "production" &&
  //   addWebpackAlias({
  //     react: "preact/compat",
  //     "react-dom": "preact/compat"
  //   })
);

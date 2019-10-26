module.exports = {
  content: ["./public/**/*.{html,js}", "./src/**/*.{js,jsx}"],
  // Include any special characters you're using in this regular expression
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
};

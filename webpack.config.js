const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/js/miniprogram.js",
  output: {
    filename: "miniprogram.js",
    path: path.resolve(__dirname, "public/js"),
  },
  module: {
    rules: [
      {
        test: require.resolve("jquery"),
        loader: "expose-loader",
        options: {
          exposes: ["$", "jQuery"],
        },
      },
    ],
  },
};

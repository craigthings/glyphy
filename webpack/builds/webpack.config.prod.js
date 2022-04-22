"use strict";
const path = require("path");
const root = path.join(__dirname, "../../");

module.exports = {
  mode: "production",
  entry: {
    glyphy: path.join(root, "src", "build"),
  },

  output: {
    filename: "[name].min.js",
    path: path.join(root, "build"),
  }
};

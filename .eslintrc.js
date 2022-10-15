module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["plugin:react-hooks/recommended"],
  rules: {
    "react-hooks/exhaustive-deps": "error",
  },
};

/** @type {import("prettier").Config & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
  semi: false,
  singleQuote: false,
  trailingComma: "es5",
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",

  plugins: ["prettier-plugin-tailwindcss"],

  tailwindStylesheet: "./app/globals.css",
  tailwindFunctions: ["cn", "cva", "clsx"],
}

export default config

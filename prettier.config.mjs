/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn"],
  printWidth: 88,
  semi: true,
  singleQuote: false,
};

export default config;

import globals from "globals";
import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            eqeqeq: "error",
            "no-implicit-globals": "error",
            "no-undef": "error",
            "no-unused-vars": "warn",
        },
    },
    {
        files: ["**/*.mjs"],
        languageOptions: {
            sourceType: "module",
        },
    },
    {
        ignores: ["node_modules/"],
    },
];

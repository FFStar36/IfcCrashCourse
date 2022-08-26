import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
    input: "public/javascripts/ifcApp.js",
    output: [
        {
            format: "esm",
            file: "public/javascripts/bundle.js",
            type: "module"
        },
    ],
    plugins: [
        resolve(),
        commonjs(),
        json()
    ],
};
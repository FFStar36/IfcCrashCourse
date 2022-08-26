import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
    input: "public/javascripts/uploadIFC.js",
    output: [
        {
            format: "esm",
            file: "public/javascripts/uploadBundle.js",
        },
    ],
    plugins: [
        resolve(),
        commonjs(),
        json()
    ],
};
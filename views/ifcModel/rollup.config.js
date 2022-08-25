import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
    input: "public/javascripts/ifcApp.js",
    output: [
        {
            format: "esm",
            file: "public/javascripts/bundle.js",
        },
    ],
    plugins: [
        resolve(),
        commonjs()
    ],
};
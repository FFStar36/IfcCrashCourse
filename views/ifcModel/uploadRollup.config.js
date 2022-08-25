import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

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
        commonjs()
    ],
};
import { Color } from '../../node_modules/three';
import { IfcViewerAPI } from '../../node_modules/web-ifc-viewer';
// import * as mongoose from '../../node_modules/mongoose';


// import express from "express";

const input = document.getElementById('file-input');
input.onchange = loadIfc;

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xf8f9fa) });
await viewer.IFC.setWasmPath("../../../wasm/");

async function loadIfc(event) {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    // Export to glTF and JSON
    const result = await viewer.GLTF.exportIfcFileAsGltf({
        ifcFileUrl: url,
        getProperties: true,
        splitByFloors: true
    });
    // // Download result
    // const link = document.createElement('a');
    // document.body.appendChild(link);
    //
    // for(const categoryName in result.gltf) {
    //     const category = result.gltf[categoryName];
    //     for(const levelName in category) {
    //         const file = category[levelName].file;
    //         if(file) {
    //             link.download = `${file.name}_${levelName}.gltf`;
    //             link.href = URL.createObjectURL(file);
    //             link.click();
    //         }
    //     }
    // }
    //
    // for(let jsonFile of result.json) {
    //     link.download = `${jsonFile.name}.json`;
    //     link.href = URL.createObjectURL(jsonFile);
    //     link.click();
    // }
    //
    // link.remove();
}

// Store as GirdFS
// const dbUrl = 'mongodb://localhost:27017/ifc';
//
// mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });
//
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });
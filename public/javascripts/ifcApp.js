import { Color } from '../../node_modules/three';
import { IfcViewerAPI } from '../../node_modules/web-ifc-viewer';

import {createTreeMenu} from './costumeIfcFunctions/treeMenu'
import {exportFloorPlans} from './costumeIfcFunctions/exportFloorPlans'
import {showFloorPlans} from "./costumeIfcFunctions/showFloorPlans";

async function loadIfc(url) {

    const container = document.getElementById('viewer-container');
    const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xf8f9fa) });
    await viewer.IFC.setWasmPath("../../../wasm/");

    const model = await viewer.IFC.loadIfcUrl(url, true);

    // Add dropped shadow and post-processing effect
    // await viewer.shadowDropper.renderShadow(model.modelID);
    // viewer.context.renderer.postProduction.active = true;

    // FloorPlans
    await showFloorPlans(viewer, model)
    await exportFloorPlans(viewer, model)

    // Planes
    let clippingPlanesActive = false
    const clipperButton = document.querySelector("#clipperButton")

    clipperButton.onclick = () =>{
        clippingPlanesActive = !clippingPlanesActive
        viewer.clipper.active = clippingPlanesActive
    }

    // Measure
    let measureActive = false
    const measureButton = document.querySelector("#measureButton")

    measureButton.onclick = () =>{
        measureActive = !measureActive
        viewer.dimensions.active = measureActive;
        viewer.dimensions.previewActive = measureActive;
    }

    // createTree
    await createTreeMenu(viewer, model)

    // WindowEvents
    window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

    window.ondblclick = async () => {
        // Props
        const result = await viewer.IFC.selector.highlightIfcItem();
        if (!result) return;
        const { modelID, id } = result;
        const props = await viewer.IFC.getProperties(modelID, id, true, false);
        showProps(props)

        viewer.IFC.selector.pickIfcItem();
        if(clippingPlanesActive){
            viewer.clipper.createPlane()
        }
        if(measureActive){
            viewer.dimensions.create();
        }
    }

    window.onkeydown = (event) => {
        if(event.code === 'Delete' && clippingPlanesActive) {
            viewer.clipper.deleteAllPlanes()
        }
        if(event.code === 'Delete' && measureActive) {
            viewer.dimensions.delete();
        }
    }
}

loadIfc("../../../wasm/01.ifc");

// Props
function showProps(properties){
    delete properties.mats;
    delete properties.type;
    console.log(properties)
}


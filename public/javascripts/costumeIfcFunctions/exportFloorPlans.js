import {MeshBasicMaterial } from '../../../node_modules/three';
import Drawing from '../../../node_modules/dxf-writer';

export async function exportFloorPlans(viewer, model) {

    // Generate all plans
    await viewer.plans.computeAllPlanViews(model.modelID);

    // Floor plan viewing
    const allPlans = viewer.plans.getAll(model.modelID);
    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
    viewer.dxf.initializeJSDXF(Drawing);

    const storeys = ifcProject.children[0].children[0].children;
    for (let storey of storeys) {
        for (let child of storey.children) {
            if (child.children.length) {
                storey.children.push(...child.children);
            }
        }
    }

    // create Export Btns
    for (const plan of allPlans) {
        const currentPlan = viewer.plans.planLists[model.modelID][plan];

        const container = document.getElementById('pdfExportButton');
        const button = document.createElement('button');
        container.appendChild(button);
        // button.textContent = 'Export ' + currentPlan.name;
        button.id = 'Export ' + currentPlan.name;
        button.className = 'ExportPlans'
        button.onclick = () => {
            const storey = storeys.find(storey => storey.expressID === currentPlan.expressID);
            drawProjectedItems(storey, currentPlan, model.modelID, viewer);
        };
    }

    // First toggleOfBtn
    toggleOffExportPlanBtn()
}

export async function drawProjectedItems(storey, plan, modelID, viewer){

    const dummySubsetMat = new MeshBasicMaterial({visible: false});

    // Create a new drawing (if it doesn't exist)
    if (!viewer.dxf.drawings[plan.name]) viewer.dxf.newDrawing(plan.name);

    // Get the IDs of all the items to draw
    const ids = storey.children.map(item => item.expressID);

    // If no items to draw in this layer in this floor plan, let's continue
    if (!ids.length) return;

    // If there are items, extract its geometry
    const subset = viewer.IFC.loader.ifcManager.createSubset({
        modelID,
        ids,
        removePrevious: true,
        customID: 'floor_plan_generation',
        material: dummySubsetMat,
    });

    // Get the projection of the items in this floor plan
    const filteredPoints = [];
    const edges = await viewer.edgesProjector.projectEdges(subset);
    const positions = edges.geometry.attributes.position.array;

    // Lines shorter than this won't be rendered
    const tolerance = 0.01;
    for (let i = 0; i < positions.length - 5; i += 6) {

        const a = positions[i] - positions[i + 3];
        // Z coords are multiplied by -1 to match DXF Y coordinate
        const b = -positions[i + 2] + positions[i + 5];

        const distance = Math.sqrt(a * a + b * b);

        if (distance > tolerance) {
            filteredPoints.push([positions[i], -positions[i + 2], positions[i + 3], -positions[i + 5]]);
        }

    }

    // Draw the projection of the items
    viewer.dxf.drawEdges(plan.name, filteredPoints, 'Projection', Drawing.ACI.BLUE, 'CONTINUOUS');

    // Clean up
    edges.geometry.dispose();

    // Draw all sectioned items
    viewer.dxf.drawNamedLayer(plan.name, plan, 'thick', 'Section', Drawing.ACI.RED, 'CONTINUOUS');
    viewer.dxf.drawNamedLayer(plan.name, plan, 'thin', 'Section_Secondary', Drawing.ACI.CYAN, 'CONTINUOUS');

    const result = viewer.dxf.exportDXF(plan.name);
    const link = document.createElement('a');
    link.download = 'floorplan.dxf';
    link.href = URL.createObjectURL(result);
    document.body.appendChild(link);
    link.click();
    link.remove();

}

export function toggleOffExportPlanBtn(exception = null){
    let exportButtons = document.getElementsByClassName('ExportPlans')
    for(let btn of exportButtons){
        if(btn.id !== exception) {
            btn.style.display = "none"
        }
    }
}

export function toggleOnExportPlanBtn(planName){
    let buttonID = 'Export ' + planName;
    let btn = document.getElementById(buttonID)
    btn.style.display = "inline"
    toggleOffExportPlanBtn(buttonID)
}
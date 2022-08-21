import { Color, LineBasicMaterial, MeshBasicMaterial } from '../../node_modules/three';
import { IfcViewerAPI } from '../../node_modules/web-ifc-viewer';
import Drawing from '../../node_modules/dxf-writer'

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

async function loadIfc(url) {

    await viewer.IFC.setWasmPath("../../../wasm/");

    // Load the model
    const model = await viewer.IFC.loadIfcUrl(url, true);

    // Add dropped shadow and post-processing effect
    // await viewer.shadowDropper.renderShadow(model.modelID);
    // viewer.context.renderer.postProduction.active = true;



    // Setup camera controls
    const controls = viewer.context.ifcCamera.cameraControls;
    controls.setPosition(7.6, 4.3, 24.8, false);
    controls.setTarget(-7.1, -0.3, 2.5, false);

    await viewer.plans.computeAllPlanViews(model.modelID);

    const lineMaterial = new LineBasicMaterial({ color: 'black' });
    const baseMaterial = new MeshBasicMaterial({
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1,
    });
    await viewer.edges.create('example', model.modelID, lineMaterial, baseMaterial);

    // Floor plan viewing
    const allPlans = viewer.plans.getAll(model.modelID);

    const container = document.getElementById('button-container');

    for (const plan of allPlans) {
        const currentPlan = viewer.plans.planLists[model.modelID][plan];
        const button = document.createElement('button');
        container.appendChild(button);
        button.textContent = currentPlan.name;
        button.onclick = () => {
            viewer.plans.goTo(model.modelID, plan);
            viewer.edges.toggle('example', true);
        };
    }

    const button = document.createElement('button');
    container.appendChild(button);
    button.textContent = 'Exit';
    button.onclick = () => {
        viewer.plans.exitPlanView();
        viewer.edges.toggle('example', false);
    };

    // Floor plan export
    viewer.dxf.initializeJSDXF(Drawing);

    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
    const storeys = ifcProject.children[0].children[0].children;
    for (let storey of storeys) {
        for (let child of storey.children) {
            if (child.children.length) {
                storey.children.push(...child.children);
            }
        }
    }

    for (const plan of allPlans) {
        const currentPlan = viewer.plans.planLists[model.modelID][plan];
        console.log(currentPlan);

        const button = document.createElement('button');
        container.appendChild(button);
        button.textContent = 'Export ' + currentPlan.name;
        button.onclick = () => {
            const storey = storeys.find(storey => storey.expressID === currentPlan.expressID);
            drawProjectedItems(storey, currentPlan, model.modelID);
        };
    }

    ////////////////// Events/ Buttons
    ///////// Schnitte
    let clippingPlanesActive = false
    const clipperButton = document.querySelector("#clipperButton")

    clipperButton.onclick = () =>{
        clippingPlanesActive = !clippingPlanesActive
        viewer.clipper.active = clippingPlanesActive
    }

    ///////// Messungen
    let measureActive = false
    const measureButton = document.querySelector("#measureButton")

    measureButton.onclick = () =>{
        measureActive = !measureActive
        viewer.dimensions.active = measureActive;
        viewer.dimensions.previewActive = measureActive;
    }

    // visibility
    model.removeFromParent();

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

    window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

    window.onkeydown = (event) => {
        if(event.code === 'Delete' && clippingPlanesActive) {
            viewer.clipper.deleteAllPlanes()
        }
        if(event.code === 'Delete' && measureActive) {
            viewer.dimensions.delete();
        }
    }

    // spetial Tree
    const project = await viewer.IFC.getSpatialStructure(model.modelID)
    await createTreeMenu(project)
}

loadIfc("../../../wasm/01.ifc");

const scene = viewer.context.getScene();
let ifcBuildingStoryID

// Props
function showProps(properties){

    delete properties.mats;
    delete properties.type;
    console.log(properties)
}



// Tree view
const toggler = document.getElementsByClassName("caret");
for (let i = 0; i < toggler.length; i++) {
    toggler[i].onclick = () => {
        toggler[i].parentElement.querySelector(".nested").classList.toggle("active");
        toggler[i].classList.toggle("caret-down");
    }
}

let elementsInBuildingStorey = {}

async function createTreeMenu(ifcProject) {
    const root = document.getElementById("tree-root");
    removeAllChildren(root);
    let itemsProcessed = 0
    const ifcProjectNode = createNestedChild(root, ifcProject);
    ifcProject.children.forEach((child, index, array) => {
        constructTreeMenuNode(ifcProjectNode, child);
        itemsProcessed++
        if(itemsProcessed === array.length){
            setupAllStories(elementsInBuildingStorey)
                .then(() =>{
                    const togglerElements = document.getElementsByClassName("caret");
                    for (let i = 0; i < togglerElements.length; i++) {
                        togglerElements[i].onclick = () => {
                            togglerElements[i].parentElement.querySelector(".nested").classList.toggle("active");
                            togglerElements[i].classList.toggle("caret-down");
                        }
                    }
                })
        }
    })
}



function nodeToString(node) {
    return `${node.type} - ${node.expressID}`
}

function addNodeArray(node){
    let ifcType =  node.type.toString()
    if(Object.keys(elementsInBuildingStorey).length === 0 || elementsInBuildingStorey[ifcBuildingStoryID] === undefined){
        elementsInBuildingStorey[ifcBuildingStoryID] ={}
    }
    let obj = elementsInBuildingStorey[ifcBuildingStoryID]
    if(obj[ifcType] !== undefined){
        obj[ifcType].push(node.expressID)
    }else{
        obj[ifcType] = [node.expressID]
    }
}

function constructTreeMenuNode(parent, node) {
    const children = node.children;
    if (children.length === 0) {
        createSimpleChild(parent, node, children);
        return;
    }
    const nodeElement = createNestedChild(parent, node);
    children.forEach(child => {
        constructTreeMenuNode(nodeElement, child);
    })
}

function createNestedChild(parent, node) {
    const content = nodeToString(node);
    if(content.includes("IFCBUILDINGSTOREY")) {
        ifcBuildingStoryID = node.expressID
    }
    const root = document.createElement('li');
    createTitle(root, content);
    const childrenContainer = document.createElement('ul');
    childrenContainer.classList.add("nested");
    root.appendChild(childrenContainer);
    parent.appendChild(root);
    return childrenContainer;
}

function createTitle(parent, content) {
    const title = document.createElement("span");
    title.classList.add("caret");
    title.onclick = () => {
        title.parentElement.querySelector(".nested").classList.toggle("active");
        title.classList.toggle("caret-down");
    }
    title.textContent = content;
    parent.appendChild(title);
}

function createSimpleChild(parent, node, children) {
    const content = nodeToString(node);
    const childNode = document.createElement('li');
    childNode.classList.add('leaf-node');
    childNode.textContent = content;
    parent.appendChild(childNode);

    addNodeArray(node)

    childNode.onmouseenter = () => {
        viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
    }

    childNode.onclick = async () => {
        viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID]);
    }
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// Visibility
async function setupAllStories() {
    const allStorieKeys = Object.keys(elementsInBuildingStorey);
    for(let storieName of allStorieKeys) {
        const storeyIfcElements = elementsInBuildingStorey[storieName]
        await setupStorey(storieName, storeyIfcElements);
    }
}

async function setupStorey(storieName, storeyIfcElements){
    const allIfcElementNames = Object.keys(storeyIfcElements);
    for(let ifcElementName of allIfcElementNames) {
        const elementIDs = storeyIfcElements[ifcElementName]
        await setupCategory(storieName, ifcElementName, elementIDs);
    }
}

// Stores the created subsets
const subsets = {};
async function setupCategory(storieName, ifcElementName, elementIDs){
    let customID = createCustomID(storieName, ifcElementName)
    subsets[customID] = await newSubsetOfElements(customID, elementIDs)
    createStories(storieName)
    setupCheckBox(storieName, ifcElementName)
}

async function setupCheckBox(storieName, ifcElementName){
    createCheckBox(storieName, ifcElementName)
    let customID = createCustomID(storieName, ifcElementName)
    let checkBox = document.getElementById(customID)

    checkBox.addEventListener('change', (event) => {
        const checked = event.target.checked;
        const subset = subsets[customID];
        if (checked) scene.add(subset);
        else subset.removeFromParent();
    });
}

async function createStories(storieName){
    let storeyID = storieName

    let division = document.getElementById(storieName)
    if(division === null){
        let divElements = document.getElementById("ifcStorey")

        let newLi = document.createElement('li');
        divElements.appendChild(newLi)

        let span = document.createElement('span');


        viewer.IFC.getProperties(0,  parseInt(storeyID), true, false).then(function(value){
            span.innerHTML = value.Name.value
        })

        span.className = "caret"
        newLi.appendChild(span);

        let newUl = document.createElement('ul');
        newUl.className = "nested"
        newLi.appendChild(newUl)

        let newDiv = document.createElement('div');
        newDiv.id = storieName
        newUl.appendChild(newDiv)
    }
}

function createCheckBox(storieName, ifcElementName){
    let division = document.getElementById(storieName)
    let newLi = document.createElement('li');

    division.appendChild(newLi);
    let checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.id = createCustomID(storieName, ifcElementName)
    checkBox.className = "ifcElement"
    checkBox.checked = true
    newLi.appendChild(checkBox);

    let label = document.createElement('label')
    label.htmlFor = createCustomID(storieName, ifcElementName);
    label.appendChild(document.createTextNode(` ${ifcElementName}`));
    newLi.appendChild(label);

    let p = document.createElement("p");
    newLi.appendChild(p);
}

function createCustomID(storieName, ifcElementName){
    let customID = `${storieName}_${ifcElementName}`
    return customID
}

// Creates a new subset containing all elements of a category
async function newSubsetOfElements(customID, elementIDs) {
    return viewer.IFC.loader.ifcManager.createSubset({
        modelID: 0,
        scene,
        ids: elementIDs,
        removePrevious: true,
        customID,
    });
}




const dummySubsetMat = new MeshBasicMaterial({visible: false});

async function drawProjectedItems(storey, plan, modelID) {

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


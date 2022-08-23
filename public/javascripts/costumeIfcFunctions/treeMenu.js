
export async function createTreeMenu(viewer, model) {

    model.removeFromParent();
    const scene = viewer.context.getScene();
    const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID)

    let ifcBuildingStoryID
    let elementsInBuildingStorey = {}
    let subsets = {};

    treeMenu(ifcProject)

    async function treeMenu(ifcProject) {
        const root = document.getElementById("tree-root");
        removeAllChildren(root);
        let itemsProcessed = 0
        const ifcProjectNode = createNestedChild(root, ifcProject);
        ifcProject.children.forEach((child, index, array) => {
            constructTreeMenuNode(ifcProjectNode, child);
            itemsProcessed++
            if (itemsProcessed === array.length) {
                setupAllStories(elementsInBuildingStorey)
                    .then(() => {
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

    function addNodeArray(node) {
        let ifcType = node.type.toString()
        if (Object.keys(elementsInBuildingStorey).length === 0 || elementsInBuildingStorey[ifcBuildingStoryID] === undefined) {
            elementsInBuildingStorey[ifcBuildingStoryID] = {}
        }
        let obj = elementsInBuildingStorey[ifcBuildingStoryID]
        if (obj[ifcType] !== undefined) {
            obj[ifcType].push(node.expressID)
        } else {
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
        if (content.includes("IFCBUILDINGSTOREY")) {
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
        for (let storieName of allStorieKeys) {
            const storeyIfcElements = elementsInBuildingStorey[storieName]
            await setupStorey(storieName, storeyIfcElements);
        }
    }

    async function setupStorey(storieName, storeyIfcElements) {
        const allIfcElementNames = Object.keys(storeyIfcElements);
        for (let ifcElementName of allIfcElementNames) {
            const elementIDs = storeyIfcElements[ifcElementName]
            await setupCategory(storieName, ifcElementName, elementIDs);
        }
    }

    async function setupCategory(storieName, ifcElementName, elementIDs) {
        let customID = createCustomID(storieName, ifcElementName)
        subsets[customID] = await newSubsetOfElements(customID, elementIDs)
        createStories(storieName)
        setupCheckBox(storieName, ifcElementName)
    }

    async function setupCheckBox(storieName, ifcElementName) {
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

    async function createStories(storieName) {
        let storeyID = storieName

        let division = document.getElementById(storieName)
        if (division === null) {
            let divElements = document.getElementById("ifcStorey")

            let newLi = document.createElement('li');
            divElements.appendChild(newLi)

            let span = document.createElement('span');


            viewer.IFC.getProperties(0, parseInt(storeyID), true, false).then(function (value) {
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

    function createCheckBox(storieName, ifcElementName) {
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
    }

    function createCustomID(storieName, ifcElementName) {
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
}
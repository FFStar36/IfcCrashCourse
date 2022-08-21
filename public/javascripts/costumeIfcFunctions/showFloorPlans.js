import {LineBasicMaterial, MeshBasicMaterial} from "../../../node_modules/three";

export async function showFloorPlans(viewer, model){

    // Generate all plans
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
    const container = document.getElementById('planViews');

    // create Exit
    const label = document.createElement('label');
    label.className = "btn btn-secondary active"
    label.textContent = "3D-View";
    container.appendChild(label);
    function createExit(myCallback) {
        let input = document.createElement("input");
        input.type = "radio";
        input.name = "options";
        input.autocomplete = "off";
        input.id = "3DView"
        label.appendChild(input)
        myCallback(label);
    }

    function addEvent(input) {
        input.addEventListener('click', function () {
            viewer.plans.exitPlanView();
            viewer.edges.toggle('example', false);
        })
    }
    createExit(addEvent)

    // create Plans
    for (const plan of allPlans) {
        const currentPlan = viewer.plans.planLists[model.modelID][plan];
        const label = document.createElement('label');
        label.className = "btn btn-secondary"
        label.textContent = currentPlan.name;
        container.appendChild(label);

        function createInput(myCallback) {
            let input = document.createElement("input");
            input.type = "radio";
            input.name = "options";
            input.autocomplete = "off";

            input.id = currentPlan.name
            label.appendChild(input)
            myCallback(label);
        }

        function addEvent(input) {
            input.addEventListener('click', function () {
                viewer.plans.goTo(model.modelID, plan);
                viewer.edges.toggle('example', true);
            })
        }
        createInput(addEvent)
    }
}
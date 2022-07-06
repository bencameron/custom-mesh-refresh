let divId = "MyViewerDiv";
let viewer;
let container;
let sceneBuilder;
let modelBuilder;
let view;
let buttonGroup;
let graphicsObjects = new THREE.Object3D();

async function setupViewer() {
    await new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({}, function () {
            resolve();
        });
    });

    const options3d = {
        disabledExtensions: {
          explode:true,
          bimwalk: true,
          section: true
        }
      };

    container = document.getElementById(divId);
    viewer = new Autodesk.Viewing.GuiViewer3D(container, options3d);
    viewer.start();

    await viewer.loadExtension('Autodesk.Viewing.SceneBuilder');
    sceneBuilder = viewer.getExtension('Autodesk.Viewing.SceneBuilder');

    // Create a dummy model first that conserves memory, so that we can avoid the "Model is empty" dialog
    //  This is a workaround provided by Denis Gregor in 5/27/20 email for a bug in the viewer
    await sceneBuilder.addNewModel({ conserveMemory: true });
    modelBuilder = await sceneBuilder.addNewModel({});

    addButton();

    addCustomMeshes();

    viewer.impl.invalidate(true, true);
    resetView();
}

function addCustomMeshes() {
    addCylinders(5, 100);
}

function addCylinders(rowCount, countPerRow) {
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        for (let i = 0; i < countPerRow; i++) {
            let purple = new THREE.MeshPhongMaterial({
                color: new THREE.Color(1, 0, 1)
            });

            let geometry = new THREE.CylinderGeometry(20, 20, 100, 8, 1, false, 0, Math.PI * 2);
            let bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
            let matrix = new THREE.Matrix4();
            matrix.fromArray([1,0,0,0,
                              0,1,0,0,
                              0,0,1,0,
                              i * 50, 0, rowIndex * 50, 1]);
            bufferGeometry.applyMatrix(matrix);
            mesh = new THREE.Mesh(bufferGeometry, purple);
            modelBuilder.addMesh(mesh);
            graphicsObjects.add(mesh);
        }
    }
}

function resetView() {
    resetCamera();

    viewer.addEventListener(Autodesk.Viewing.CAMERA_TRANSITION_COMPLETED, setHomeView);
    viewer.fitToView();

    function setHomeView() {
    viewer.impl['controls'].recordHomeView();
    viewer.removeEventListener(Autodesk.Viewing.CAMERA_TRANSITION_COMPLETED, setHomeView);
    }
}

function resetCamera() {
    const camera = viewer.getCameraFromViewArray([
        1, 1, 1,
        0, 0, 0,
        0, 1, 0,
        this.getAspect(),
        50 * Math.PI / 180,
        60,
        1
    ]);

    viewer.impl.setViewFromCamera(camera, true, true);
}

function getAspect() {
    return container.clientWidth / container.clientHeight;
}

function addButton() {
    buttonGroup = viewer.toolbar.getControl('TestToolbar');
    if (!buttonGroup) {
        buttonGroup = new Autodesk.Viewing.UI.ControlGroup('TestExtension');
        viewer.toolbar.addControl(buttonGroup);
    }

    let button = new Autodesk.Viewing.UI.Button("Refresh");
    button.onClick = () => refreshGraphics();
    button.setToolTip("Refresh");
    
    buttonGroup.addControl(button);
}

function refreshGraphics() {
    resetModelBuilder();
    addCustomMeshes();

    viewer.impl.invalidate(true, true);

    resetView();            
}

function resetModelBuilder() {
    if (!graphicsObjects || graphicsObjects.children.length === 0) {
      return;
    }

    const matMan = viewer.impl.matman();
    graphicsObjects.children.forEach(c => {
      modelBuilder.removeMesh(c);
      modelBuilder.removeGeometry(c.geometry);

      const matName = `model:${modelBuilder.model.id}|mat:${c.material.materialManagerName}`;
      matMan.removeMaterial(matName);
    })

    graphicsObjects.children.length = 0;
  }
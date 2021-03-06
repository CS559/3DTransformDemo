/*jshint esversion: 6 */
// @ts-check

// a premade function to construct a running canvas, 
// please read runCanvas.js for more details 
import { RunCanvas } from "./Libs/runCanvas.js";
import * as T from "./THREE/src/Three.js";
import { OrbitControls } from "./THREE/examples/jsm/controls/OrbitControls.js";

/**
 * Convert angles from degrees to radians
 * @param {Number} angle 
 */
function degToRad(angle) {
    return angle / 180 * Math.PI;
}

/**
 * Draw a coordinate system
 */
function drawCsys(colors = ["black", "grey"]) {
    let csys = new T.Group();
    let dimension = 12;
    let axisGeom = new T.BoxGeometry(0.05, 0.05, dimension);
    let lineGeom = new T.BoxGeometry(0.02, 0.02, dimension / 2);
    let axisMat = new T.MeshStandardMaterial({ color: colors[0]});
    let lineMat = new T.MeshStandardMaterial({ color: colors[1]});
    let arrowGeom = new T.ConeGeometry(0.2, 0.5);
    
    let axisX = new T.Mesh(axisGeom, axisMat);
    let arrowX = new T.Mesh(arrowGeom, axisMat);
    arrowX.position.set(0, 0, dimension / 2);
    arrowX.rotateX(Math.PI / 2);
    axisX.add(arrowX);
    axisX.rotateY(Math.PI / 2);
    csys.add(axisX);

    let axisY = new T.Mesh(axisGeom, axisMat);
    let arrowY = new T.Mesh(arrowGeom, axisMat);
    arrowY.position.set(0, 0, dimension / 2);
    arrowY.rotateX(Math.PI / 2);
    axisY.add(arrowY);
    axisY.rotateX(-Math.PI / 2);
    csys.add(axisY);

    let axisZ = new T.Mesh(axisGeom, axisMat);
    let arrowZ = new T.Mesh(arrowGeom, axisMat);
    arrowZ.position.set(0, 0, dimension / 2);
    arrowZ.rotateX(Math.PI / 2);
    axisZ.add(arrowZ);
    csys.add(axisZ);

    let lineMesh = new T.Mesh(lineGeom, lineMat);
    for (let i = -dimension / 2; i <= dimension / 2; i++) {
        for (let j = -dimension / 2; j <= dimension / 2; j++) {
            if ((i == 0 && j > 0) || (i > 0 && j == 0)) {
                let lineX = lineMesh.clone();
                lineX.position.set(dimension / 4, i, j);
                lineX.rotateY(Math.PI / 2);
                csys.add(lineX);

                let lineY = lineMesh.clone();
                lineY.position.set(i, dimension / 4, j);
                lineY.rotateX(-Math.PI / 2);
                csys.add(lineY);

                let lineZ = lineMesh.clone();
                lineZ.position.set(i, j, dimension / 4);
                csys.add(lineZ);
            }
        }
    }
    
    return csys;
}

/**
 * Do transforms as specified in transformList. The number of transforms 
 * to do is decided by param
 */
function doTransform(scene, transformList, param) {
    // is the text in the code section under the canvas
    let html = "";

    // 0 - 2 are lights, 3 is the coordinate system
    for (let i = scene.children.length; i >= 4; i--) {
        scene.remove(scene.children[i]);
    }

    // iterate through all transforms in the list
    // but some will get done, some will not (based on how big param is)
    // look at the array test1 in the beginning of this script to have an idea of how "t
    // below would be like
    transformList.forEach(function (t, i) {
        let command = t[0];
        let name = t[1];
        let object = scene.getObjectByName(name);

        // keep track of which commands are ready to be run
        let amt = (i > param) ? 0 : Math.min(1, param - i);

        // console.log(`param ${param} i ${i} amt ${amt} `)

        /**
         * made a local function so it has access to direction and list
         * @param {Number} amt
         * @param {string} htmlLine
         */
        function stylize(amt, htmlLine) {
            let style = (amt <= 0) ? "c-zero" : ((amt < 1) ? "c-act" : "c-one");
            return (`<span class="${style}">${htmlLine}</span><br/>`);
        }

        if (command == "box") {
            let color = t.length > 5 ? t[5] : "blue";
            let parent;
            let parentName;
            if (t.length > 6) {
                parent = scene.getObjectByName(t[6]);
                parentName = t[6];
            } else {
                parent = scene;
                parentName = "scene";
            }
            if (!object && amt) {
                let boxMat = new T.MeshStandardMaterial({color: color});
                let width = t[2];
                let height = t[3];
                let depth = t[4];
                let boxGeom = new T.BoxGeometry(width, height, depth);
                let boxMesh = new T.Mesh(boxGeom, boxMat);
                boxMesh.name = name;
                parent.add(boxMesh);
                let axesHelper = new T.AxesHelper(3);
                boxMesh.add(axesHelper);
            } 
            if (object && !amt) {
                scene.remove(object);
            }
            html += stylize(amt, `let ` + name + `Mat = new T.MeshStandardMaterial({color: "${color}"});`);
            html += stylize(amt, `let ` + name + `Geom = new T.BoxGeometry(${t[2]}, ${t[3]}, ${t[4]});`);
            html += stylize(amt, `let ` + name + `Mesh = new T.Mesh(` + name + `Geom, `+ name + `Mat);`);
            html += stylize(amt, parentName + `.add(` + name + `Mesh);`);
        } else if (command == "cone") {
            let color = t.length > 4 ? t[4] : "blue";
            let parent;
            let parentName;
            if (t.length > 5) {
                parent = scene.getObjectByName(t[5]);
                parentName = t[5];
            } else {
                parent = scene;
                parentName = "scene";
            }
            if (!object && amt) {
                let coneMat = new T.MeshStandardMaterial({color: color});
                let radius = t[2];
                let height = t[3];
                let coneGeom = new T.ConeGeometry(radius, height);
                let coneMesh = new T.Mesh(coneGeom, coneMat);
                coneMesh.name = name;
                parent.add(coneMesh);
                let axesHelper = new T.AxesHelper(3);
                coneMesh.add(axesHelper);
            } 
            if (object && !amt) {
                scene.remove(object);
            }
            html += stylize(amt, `let ` + name + `Mat = new T.MeshStandardMaterial({color: "${color}"});`);
            html += stylize(amt, `let ` + name + `Geom = new T.ConeGeometry(${t[2]}, ${t[3]});`);
            html += stylize(amt, `let ` + name + `Mesh = new T.Mesh(` + name + `Geom, `+ name + `Mat);`);
            html += stylize(amt, parentName + `.add(` + name + `Mesh);`);
        } else if (command == "translateX") {
            let x = t[2] * amt;
            if (object && amt > 0) {
                object.translateX(x);
            }
            html += stylize(amt, name + `.translationX(${x.toFixed(1)});`);
        } else if (command == "translateY") {
            let y = t[2] * amt;
            if (object && amt > 0) {
                object.translateY(y);
            }
            html += stylize(amt, name + `.translationY(${y.toFixed(1)});`);
        } else if (command == "translateZ") {
            let z = t[2] * amt;
            if (object && amt > 0) {
                object.translateZ(z);
            }
            html += stylize(amt, name + `.translationZ(${z.toFixed(1)});`);
        } else if (command == "position") {
            let x = t[2] * amt;
            let y = t[3] * amt;
            let z = t[4] * amt;
            if (object && amt > 0) {
                object.position.set(x, y, z);
            }
            html += stylize(amt, name + `.position.set(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)});`);
        } else if (command == "rotateX") {
            let a = t[2] * amt;
            if (object && amt > 0) {
                object.rotateX(degToRad(a));
            }
            html += stylize(amt, name + `.rotateX(${a.toFixed(1)});`);
        } else if (command == "rotateY") {
            let a = t[2] * amt;
            if (object && amt > 0) {
                object.rotateY(degToRad(a));
            }
            html += stylize(amt, name + `.rotateY(${a.toFixed(1)});`);
        } else if (command == "rotateZ") {
            let a = t[2] * amt;
            if (object && amt > 0) {
                object.rotateZ(degToRad(a));
            }
            html += stylize(amt, name + `.rotateZ(${a.toFixed(1)});`);
        } else if (command == "rotation") {
            let x = t[2] * amt;
            let y = t[3] * amt;
            let z = t[4] * amt;
            if (object && amt > 0) {
                object.rotation.set(degToRad(x), degToRad(y), degToRad(z));
            }
            html += stylize(amt, name + `.rotation.set(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)});`);
        } else if (command == "rotateOnAxis") {
            let x = t[2];
            let y = t[3];
            let z = t[4];
            let a = t[5] * amt;
            let axis = new T.Vector3(x, y, z);
            if (object && amt > 0) {
                object.rotateOnAxis(axis, degToRad(a));
            }
            html += stylize(amt, name + `.rotateOnAxis(new T.Vector3(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}), ${a.toFixed(1)});`);
        } else if (command == "lookAt") {
            let x = t[2];
            let y = t[3];
            let z = t[4];
            if (object && amt > 0) {
                object.lookAt(x, y, z);
            }
            html += stylize(amt, name + `.lookAt(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)});`);
        } else if (command == "scale") {
            let x = amt * t[2] + (1 - amt) * 1;
            let y = amt * t[3] + (1 - amt) * 1;
            let z = amt * t[4] + (1 - amt) * 1;
            if (object && amt > 0) {
                object.scale.set(x, y, z);
            }
            html += stylize(amt, name + `.scale.set(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)});`);
        } else { // bad command
            console.log(`Bad transform ${t}`);
        }
    });

    return html;
}

/**
 * Create a transformation example
 * @param {string} title 
 * @param {Array} transforms 
 */
export function setExample(title, transforms = undefined) {
    // make sure each canvas has a different name
    let name = title;

    // division to hold the example 
    let exampleDiv = document.createElement("div");
    exampleDiv.id = name + "-example";
    exampleDiv.style.cssText = "width: 1200px; display: none; align-items: flex-start";
    document.getElementsByTagName("body")[0].appendChild(exampleDiv);

    // left part, including a canvas, checkboxes, a slider, and a code block
    let leftDiv = document.createElement("div");
    leftDiv.id = name + "-leftDiv";
    leftDiv.style.cssText = "width: 600px;";
    document.getElementById(exampleDiv.id).appendChild(leftDiv);

    let leftRenderer = new T.WebGLRenderer();
    leftRenderer.setSize(400, 400);
    leftRenderer.domElement.id = name + "-leftRd";
    document.getElementById(leftDiv.id).appendChild(leftRenderer.domElement);

    let leftScene = new T.Scene();
    leftScene.background = new T.Color("white");
    let leftCamera = new T.PerspectiveCamera(40, leftRenderer.domElement.width / leftRenderer.domElement.height, 1, 1000);

    leftCamera.position.z = 10;
    leftCamera.position.y = 10;
    leftCamera.position.x = 10;
    leftCamera.lookAt(0, 0, 0);

    // since we're animating, add OrbitControls
    let leftControls = new OrbitControls(leftCamera, leftRenderer.domElement);

    leftScene.add(new T.AmbientLight("white", 1));

    // two lights - both a little off white to give some contrast
    let leftDirLight = new T.DirectionalLight(0xF0E0D0, 1);
    leftDirLight.position.set(1, 1, 0);
    leftScene.add(leftDirLight);

    let leftDirLight2 = new T.DirectionalLight(0xD0E0F0, 0.7);
    leftDirLight2.position.set(0, 1, -0.2);
    leftScene.add(leftDirLight2);

    let leftCsys = drawCsys();
    leftScene.add(leftCsys);

    let leftPanel = document.createElement("div");
    leftPanel.id = name + "-leftPanel";
    leftPanel.style.cssText = "padding-top: 10px";
    document.getElementById(leftDiv.id).appendChild(leftPanel);

    // checkbox and label for showing the final result
    let resultTog = document.createElement("input");
    resultTog.setAttribute("type", "checkbox");
    resultTog.setAttribute("checked", "true");
    resultTog.id = name + "-rt";
    document.getElementById(leftPanel.id).appendChild(resultTog);

    let resultLabel = document.createElement("label");
    resultLabel.setAttribute("for", resultTog.id);
    resultLabel.innerText = "Show the final result";
    document.getElementById(leftPanel.id).appendChild(resultLabel);

    let leftCodeDiv = document.createElement("div");
    leftCodeDiv.style.cssText = "font-family: 'Courier New', Courier, monospace; " +
        "font-size: 100%; padding-top: 5px";
    document.getElementById(leftDiv.id).appendChild(leftCodeDiv);

    // right part, including a canvas, a code block
    let rightDiv = document.createElement("div");
    rightDiv.id = name + "-rightDiv";
    document.getElementById(exampleDiv.id).appendChild(rightDiv);

    let rightRenderer = new T.WebGLRenderer();
    rightRenderer.setSize(400, 400);
    rightRenderer.domElement.id = name + "-rightRd";
    document.getElementById(rightDiv.id).appendChild(rightRenderer.domElement);

    let rightScene = new T.Scene();
    rightScene.background = new T.Color("white");
    let rightCamera = new T.PerspectiveCamera(40, rightRenderer.domElement.width / rightRenderer.domElement.height, 1, 1000);

    rightCamera.position.z = 10;
    rightCamera.position.y = 10;
    rightCamera.position.x = 10;
    rightCamera.lookAt(0, 0, 0);

    // since we're animating, add OrbitControls
    let rightControls = new OrbitControls(rightCamera, rightRenderer.domElement);

    rightScene.add(new T.AmbientLight("white", 1));

    // two lights - both a little off white to give some contrast
    let rightDirLight = new T.DirectionalLight(0xF0E0D0, 1);
    rightDirLight.position.set(1, 1, 0);
    rightScene.add(rightDirLight);

    let rightDirLight2 = new T.DirectionalLight(0xD0E0F0, 0.7);
    rightDirLight2.position.set(0, 1, -0.2);
    rightScene.add(rightDirLight2);

    let rightCsys = drawCsys();
    rightScene.add(rightCsys);

    let rightPanel = document.createElement("div");
    rightPanel.id = name + "-rightPanel";
    rightPanel.style.cssText = "margin-top: 63px";
    document.getElementById(rightDiv.id).appendChild(rightPanel);

    let rightCodeDiv = document.createElement("div");
    rightCodeDiv.style.cssText = "font-family: 'Courier New', Courier, monospace; " +
        "font-size: 100%;";
    document.getElementById(rightDiv.id).appendChild(rightCodeDiv);

    resultTog.onchange = function () {
        if (resultTog.checked) {
            document.getElementById(rightDiv.id).style.display = "block";
        } else {
            document.getElementById(rightDiv.id).style.display = "none";
        }
    };

    let rc = new RunCanvas(leftRenderer.domElement, undefined);
    rc.noloop = true;
    rc.setupSlider(0, transforms.length, 0.02);
    rc.setValue(0);

    function animate() {
        let param = Number(rc.range.value);
        let leftHtml = doTransform(leftScene, transforms, param);
        leftCodeDiv.innerHTML = leftHtml;
        leftRenderer.render(leftScene, leftCamera);
        let rightHtml = doTransform(rightScene, transforms, transforms.length);
        rightCodeDiv.innerHTML = rightHtml;
        rightRenderer.render(rightScene, rightCamera);
        window.requestAnimationFrame(animate);
    }
    animate();

    return exampleDiv;
}

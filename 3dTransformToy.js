/*jshint esversion: 6 */
// @ts-check

// a premade function to construct a running canvas, 
// please read runCanvas.js for more details 
import { RunCanvas } from "./Libs/runCanvas.js";
import * as T from "./THREE/src/Three.js";
import { OrbitControls } from "./THREE/examples/jsm/controls/OrbitControls.js";
import { onWindowOnload } from "./Libs/helpers.js";
import { Material, Vector3 } from "./THREE/src/Three.js";

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
    
    // if (drawBlock) {
    //     context.fillStyle = drawBlock;
    //     square(context);
    // }
}

/**
 * Do transforms as specified in transformList. The number of transforms 
 * to do is decided by param
 */
function doTransform(scene, transformList, param, direction = 1) {
    // is the text in the code section under the canvas
    let html = "";

    // iterate through all transforms in the list
    // but some will get done, some will not (based on how big param is)
    // look at the array test1 in the beginning of this script to have an idea of how "t
    // below would be like
    transformList.forEach(function (t, i) {
        let command = t[0];
        let name = t[1];
        let object = scene.getObjectByName(name);

        // keep track of which commands are ready to be run
        let amt = (direction >= 0) ?
            (i > param) ? 0 : Math.min(1, param - i) : // if direction >= 0, do this line
            ((i + 1) < param) ? 0 : Math.min(1, (i + 1) - param); // if not, do this line

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
            if (!object) {
                let color = t.length > 5 ? t[5] : "blue";
                let boxMat = new T.MeshStandardMaterial({color: color});
                let width = t[2];
                let height = t[3];
                let depth = t[4];
                let boxGeom = new T.BoxGeometry(width, height, depth);
                let boxMesh = new T.Mesh(boxGeom, boxMat);
                boxMesh.name = name;
                scene.add(boxMesh);
                html += stylize(amt, `let boxMat = new T.MeshStandardMaterial({color: "${color}");`);
                html += stylize(amt, `let boxGeom = new T.BoxGeometry(${t[1]},${t[2]},${t[3]});`);
                html += stylize(amt, `let boxMesh = new T.Mesh(boxGeom, boxMat);`);
                html += stylize(amt, `scene.add(boxMesh);`);
            }
        } else {
            // translate, rotate, scale
            if (command == "translateX") {
                let x = t[2] * amt;
                object.position.set(0, 0, 0);
                object.translateX(x);
                html += stylize(amt, `object.translationX(${x.toFixed(1)});`);
            } else if (command == "translateY") {
                let y = t[2] * amt;
                object.position.set(0, 0, 0);
                object.translateY(y);
                html += stylize(amt, `object.translationY(${y.toFixed(1)});`);
            } else if (command == "translateZ") {
                let z = t[2] * amt;
                object.position.set(0, 0, 0);
                object.translateZ(z);
                html += stylize(amt, `object.translationZ(${z.toFixed(1)});`);
            } else if (command == "rotateX") {
                let a = t[2] * amt;
                object.rotation.set(0, 0, 0);
                object.rotateX(degToRad(a));
                html += stylize(amt, `object.rotateX(${a.toFixed(1)});`);
            } else if (command == "rotateY") {
                let a = t[2] * amt;
                object.rotation.set(0, 0, 0);
                object.rotateY(degToRad(a));
                html += stylize(amt, `object.rotateY(${a.toFixed(1)});`);
            } else if (command == "rotateZ") {
                let a = t[2] * amt;
                object.rotation.set(0, 0, 0);
                object.rotateZ(degToRad(a));
                html += stylize(amt, `object.rotateZ(${a.toFixed(1)});`);
            } else if (command == "scale") {
                let x = amt * t[2] + (1 - amt) * 1;
                let y = amt * t[3] + (1 - amt) * 1;
                let z = amt * t[4] + (1 - amt) * 1;
                object.scale.set(x, y, z);
                html += stylize(amt, `object.scale.set(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)});`);
            } else { // bad command
                console.log(`Bad transform ${t}`);
            }
        }
    });
    return html;
}

/**
 * Create a slider with given parameters
 * @param {string} name
 * @param {number} min
 * @param {number} max
 * @param {number} value
 * @param {number} step
 */
function setSlider(name, min, max, value, step) {
    let sliderDiv = document.createElement("div");

    let slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.style.width = String(270);
    slider.setAttribute("min", String(min));
    slider.setAttribute("max", String(max));
    slider.setAttribute("value", String(value));
    slider.setAttribute("step", String(step));
    sliderDiv.appendChild(slider);

    let sliderLabel = document.createElement("label");
    sliderLabel.setAttribute("for", slider.id);
    sliderLabel.innerText = name + slider.value;
    sliderLabel.style.cssText = "margin-left: 7px";
    sliderDiv.appendChild(sliderLabel);

    slider.oninput = function () {
        sliderLabel.innerText = name + String(slider.value);
    };

    return sliderDiv;
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
    exampleDiv.style.cssText = "display: none; align-items: flex-start";
    document.getElementsByTagName("body")[0].appendChild(exampleDiv);

    // left part, including a canvas, checkboxes, a slider, and a code block
    let leftDiv = document.createElement("div");
    leftDiv.id = name + "-leftDiv";
    leftDiv.style.cssText = "padding-right: 30px";
    document.getElementById(exampleDiv.id).appendChild(leftDiv);

    let leftRenderer = new T.WebGLRenderer();
    leftRenderer.setSize(400, 400);
    leftRenderer.domElement.id = name + "-rightRd";
    document.getElementById(leftDiv.id).appendChild(leftRenderer.domElement);

    let leftScene = new T.Scene();
    leftScene.background = new T.Color("white");
    let camera = new T.PerspectiveCamera(40, leftRenderer.domElement.width / leftRenderer.domElement.height, 1, 1000);

    camera.position.z = 10;
    camera.position.y = 10;
    camera.position.x = 10;
    camera.lookAt(0, 0, 0);

    // since we're animating, add OrbitControls
    let controls = new OrbitControls(camera, leftRenderer.domElement);

    leftScene.add(new T.AmbientLight("white", 1));

    // two lights - both a little off white to give some contrast
    let dirLight1 = new T.DirectionalLight(0xF0E0D0, 1);
    dirLight1.position.set(1, 1, 0);
    leftScene.add(dirLight1);

    // let dirLight2 = new T.DirectionalLight(0xD0E0F0, 0.7);
    // dirLight2.position.set(0, 1, -0.2);
    // scene.add(dirLight2);

    // let dirLight3 = new T.DirectionalLight(0xD0E0F0, 0.7);
    // dirLight3.position.set(1, 0, -0.2);
    // scene.add(dirLight3);

    // // make a ground plane
    // let groundBox = new T.BoxGeometry(10, 0.1, 10);
    // let groundMesh = new T.Mesh(groundBox, new T.MeshStandardMaterial({color: "green"}));
    // // put the top of the box at the ground level (0)
    // groundMesh.position.y = -0.05;
    // scene.add(groundMesh);

    let csys = drawCsys();
    leftScene.add(csys);

    let leftPanel = document.createElement("div");
    leftPanel.id = name + "-leftPanel";
    document.getElementById(leftDiv.id).appendChild(leftPanel);

    //checkbox and label for reversion
    let dirTog = document.createElement("input");
    dirTog.setAttribute("type", "checkbox");
    dirTog.id = name + "-dt";
    document.getElementById(leftPanel.id).appendChild(dirTog);

    let dirLabel = document.createElement("label");
    dirLabel.setAttribute("for", dirTog.id);
    dirLabel.innerText = "Reverse";
    document.getElementById(leftPanel.id).appendChild(dirLabel);

    let leftBrOne = document.createElement("br");
    leftBrOne.id = name + "-leftBr2";
    document.getElementById(leftPanel.id).appendChild(leftBrOne);

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
        "font-size: 120%; padding-top: 5px";
    document.getElementById(leftDiv.id).appendChild(leftCodeDiv);

    // right part, including a canvas, a code block
    let rightDiv = document.createElement("div");
    rightDiv.id = name + "-rightDiv";
    document.getElementById(exampleDiv.id).appendChild(rightDiv);

    //let rightScene = setRenderer(rightDiv, name + "-rightRd");

    let rightPanel = document.createElement("div");
    rightPanel.id = name + "-rightPanel";
    rightPanel.style.cssText = "margin-top: 27px";
    document.getElementById(rightDiv.id).appendChild(rightPanel);

    // checkbox and label for showing the original coordinate system
    let orTogRight = document.createElement("input");
    orTogRight.setAttribute("type", "checkbox");
    orTogRight.setAttribute("checked", "true");
    orTogRight.id = name + "-ot";
    document.getElementById(rightPanel.id).appendChild(orTogRight);

    let orLabelRight = document.createElement("label");
    orLabelRight.setAttribute("for", orTogRight.id);
    orLabelRight.innerText = "Show the original coordinate system";
    document.getElementById(rightPanel.id).appendChild(orLabelRight);

    let rightBrOne = document.createElement("br");
    rightBrOne.id = name + "-rightBr1";
    document.getElementById(rightPanel.id).appendChild(rightBrOne);

    // checkbox and label for showing the final coordinate system
    let finalTog = document.createElement("input");
    finalTog.setAttribute("type", "checkbox");
    finalTog.id = name + "-cst";
    document.getElementById(rightPanel.id).appendChild(finalTog);

    let finalLabel = document.createElement("label");
    finalLabel.setAttribute("for", finalTog.id);
    finalLabel.innerText = "Show the final coordinate system";
    document.getElementById(rightPanel.id).appendChild(finalLabel);

    let rightCodeDiv = document.createElement("div");
    rightCodeDiv.style.cssText = "font-family: 'Courier New', Courier, monospace; " +
        "font-size: 120%; padding-top: 5px";
    document.getElementById(rightDiv.id).appendChild(rightCodeDiv);

    let rc = new RunCanvas(leftRenderer.domElement, undefined);
    rc.noloop = true;
    rc.setupSlider(0, transforms.length, 0.02);
    rc.setValue(0);

    function animate() {
        let param = Number(rc.range.value);
        doTransform(leftScene, transforms, param, dirTog ? (dirTog.checked ? -1 : 1) : 1);
        leftRenderer.render(leftScene, camera);
        window.requestAnimationFrame(animate);
    }
    animate();
    
    // if (transforms) {
    //     run(transforms);
    // }   
    return exampleDiv;
}

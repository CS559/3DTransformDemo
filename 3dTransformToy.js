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
function drawCsys() {
    let csys = new T.Group();
    let dimension = 12;
    let axisGeom = new T.BoxGeometry(0.05, 0.05, dimension);
    let lineGeom = new T.BoxGeometry(0.02, 0.02, dimension / 2);
    let axisMat = new T.MeshStandardMaterial({ color: "black"});
    let lineMat = new T.MeshStandardMaterial({ color: "grey"});
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
 * @param {HTMLDivElement} parent
 * @param {string} id
 */
function setRenderer(parent, id) {
    let renderer = new T.WebGLRenderer();
    renderer.setSize(400, 400);
    renderer.domElement.id = id;
    document.getElementById(parent.id).appendChild(renderer.domElement);

    let scene = new T.Scene();
    scene.background = new T.Color("white");
    let camera = new T.PerspectiveCamera(40, renderer.domElement.width / renderer.domElement.height, 1, 1000);

    camera.position.z = 10;
    camera.position.y = 10;
    camera.position.x = 10;
    camera.lookAt(0, 0, 0);

    // since we're animating, add OrbitControls
    let controls = new OrbitControls(camera, renderer.domElement);

    scene.add(new T.AmbientLight("white", 1));

    // two lights - both a little off white to give some contrast
    let dirLight1 = new T.DirectionalLight(0xF0E0D0, 1);
    dirLight1.position.set(1, 1, 0);
    scene.add(dirLight1);

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
    scene.add(csys);

    function animate() {
        //** EXAMPLE CODE - STUDENT SHOULD REPLACE */
        // move in a circle 
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    }
    animate();
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

    setRenderer(leftDiv, name + "-leftRd");

    let leftPanel = document.createElement("div");
    leftPanel.id = name + "-leftPanel";
    document.getElementById(leftDiv.id).appendChild(leftPanel);

    // checkbox and label for reversion
    // let dirTog = document.createElement("input");
    // dirTog.setAttribute("type", "checkbox");
    // dirTog.id = name + "-dt";
    // document.getElementById(leftPanel.id).appendChild(dirTog);

    // let dirLabel = document.createElement("label");
    // dirLabel.setAttribute("for", dirTog.id);
    // dirLabel.innerText = "Reverse";
    // document.getElementById(leftPanel.id).appendChild(dirLabel);

    // let leftBrOne = document.createElement("br");
    // leftBrOne.id = name + "-leftBr2";
    // document.getElementById(leftPanel.id).appendChild(leftBrOne);

    // // checkbox and label for showing the final result
    // let resultTog = document.createElement("input");
    // resultTog.setAttribute("type", "checkbox");
    // resultTog.setAttribute("checked", "true");
    // resultTog.id = name + "-rt";
    // document.getElementById(leftPanel.id).appendChild(resultTog);

    // let resultLabel = document.createElement("label");
    // resultLabel.setAttribute("for", resultTog.id);
    // resultLabel.innerText = "Show the final result";
    // document.getElementById(leftPanel.id).appendChild(resultLabel);

    // let leftCodeDiv = document.createElement("div");
    // leftCodeDiv.style.cssText = "font-family: 'Courier New', Courier, monospace; " +
    //     "font-size: 120%; padding-top: 5px";
    // document.getElementById(leftDiv.id).appendChild(leftCodeDiv);

    // right part, including a canvas, a code block
    let rightDiv = document.createElement("div");
    rightDiv.id = name + "-rightDiv";
    document.getElementById(exampleDiv.id).appendChild(rightDiv);

    setRenderer(rightDiv, name + "-rightRd");

    // let rightPanel = document.createElement("div");
    // rightPanel.id = name + "-rightPanel";
    // rightPanel.style.cssText = "margin-top: 27px";
    // document.getElementById(rightDiv.id).appendChild(rightPanel);

    // // checkbox and label for showing the original coordinate system
    // let orTogRight = document.createElement("input");
    // orTogRight.setAttribute("type", "checkbox");
    // orTogRight.setAttribute("checked", "true");
    // orTogRight.id = name + "-ot";
    // document.getElementById(rightPanel.id).appendChild(orTogRight);

    // let orLabelRight = document.createElement("label");
    // orLabelRight.setAttribute("for", orTogRight.id);
    // orLabelRight.innerText = "Show the original coordinate system";
    // document.getElementById(rightPanel.id).appendChild(orLabelRight);

    // let rightBrOne = document.createElement("br");
    // rightBrOne.id = name + "-rightBr1";
    // document.getElementById(rightPanel.id).appendChild(rightBrOne);

    // // checkbox and label for showing the final coordinate system
    // let finalTog = document.createElement("input");
    // finalTog.setAttribute("type", "checkbox");
    // finalTog.id = name + "-cst";
    // document.getElementById(rightPanel.id).appendChild(finalTog);

    // let finalLabel = document.createElement("label");
    // finalLabel.setAttribute("for", finalTog.id);
    // finalLabel.innerText = "Show the final coordinate system";
    // document.getElementById(rightPanel.id).appendChild(finalLabel);

    // let rightCodeDiv = document.createElement("div");
    // rightCodeDiv.style.cssText = "font-family: 'Courier New', Courier, monospace; " +
    //     "font-size: 120%; padding-top: 5px";
    // document.getElementById(rightDiv.id).appendChild(rightCodeDiv);

    // /**
    //  * Hide the user input sliders
    //  * @param {{ sliders: HTMLDivElement[]; }} customCommand
    //  */
    // function hideSliders(customCommand) {
    //     if (customCommand && customCommand.sliders) {
    //         customCommand.sliders.forEach(
    //             /**
    //              * @param {HTMLDivElement} sd
    //              */
    //             function (sd) {
    //                 sd.style.display = "none";
    //             }
    //         );
    //     }
    // }

    // /**
    //  * Hide reverse if there is save/restore command
    //  * @param {Array<Array>} transformList
    //  */
    // function hideDirTog(transformList) {
    //     for (let i = 0; i < transformList.length; i++) {
    //         let t = transformList[i];
    //         if (t[0] == "save" || t[0] == "restore") {
    //             dirTog.disabled = true;
    //             dirLabel.style.color = "lightgray";
    //             return;
    //         }
    //     }
    //     dirTog.disabled = false;
    //     dirLabel.style.color = "black";
    // }

    // /**
    //  * Reset the running canvas
    //  */
    // function reset() {
    //     leftCanvas.getContext("2d").clearRect(0, 0, leftCanvas.width, leftCanvas.height);
    //     rightCanvas.getContext("2d").clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    //     document.getElementById(canvasName + "-slider").style.display = "none";
    //     document.getElementById(canvasName + "-text").style.display = "none";
    //     document.getElementById(canvasName + "-run").style.display = "none";
    //     document.getElementById(canvasName + "-br").style.display = "none";
    // }

    // if (transforms) {
    //     hideDirTog(transforms);
    //     run(transforms);
    // } else {
    //     // the customized example
    //     let customDiv = document.createElement("div");
    //     customDiv.id = canvasName + "-custom";
    //     insertAfter(customDiv, leftPanel);

    //     // a dropdown menu used to select a command
    //     let select = makeSelect(["Please select one transform", "translate", "scale", 
    //     "rotate", "fillRect", "save", "restore"], customDiv);
    //     select.id = canvasName + "-select";
    //     select.style.cssText = "margin-bottom: 5px; margin-top: 10px";

    //     // button to add the selected transform to the list
    //     let addButton = document.createElement("button");
    //     addButton.id = canvasName + "-addB";
    //     addButton.innerHTML = "Add";
    //     addButton.style.cssText = "margin-left: 7px";
    //     customDiv.appendChild(addButton);

    //     // button to delete the last transform from the list
    //     let deleteButton = document.createElement("button");
    //     deleteButton.id = canvasName + "-deleteB";
    //     deleteButton.innerHTML = "Delete";
    //     deleteButton.style.cssText = "margin-left: 7px";
    //     customDiv.appendChild(deleteButton);

    //     // button to run the program
    //     let runButton = document.createElement("button");
    //     runButton.id = canvasName + "-runB";
    //     runButton.innerHTML = "Run";
    //     runButton.style.cssText = "margin-left: 7px";
    //     customDiv.appendChild(runButton);

    //     // button to reset the program
    //     let resetButton = document.createElement("button");
    //     resetButton.id = canvasName + "-resetB";
    //     resetButton.innerHTML = "Reset";
    //     resetButton.style.cssText = "margin-left: 7px";
    //     customDiv.appendChild(resetButton);

    //     rightCodeDiv.style.paddingTop = "38px";

    //     // initially hide the panels
    //     leftPanel.style.display = "none";
    //     rightPanel.style.display = "none";

    //     let customTransformList = [];
    //     let customCommand;
    //     let running;
    //     let lastInnerHTML = [];

    //     addButton.onclick = function () {
    //         if (customCommand) {
    //             let customTransform = [];
    //             let parameters = "";
    //             customTransform.push(customCommand.name);
    //             // read the value of sliders
    //             if (customCommand.sliders) {
    //                 customCommand.sliders.forEach(
    //                     /**
    //                      * @param {HTMLDivElement} sd
    //                      * @param {Number} i
    //                      */
    //                     function (sd, i) {
    //                         let sdSlider = /** @type {HTMLInputElement} */ (sd.children[0]);
    //                         customTransform.push(Number(sdSlider.value));
    //                         parameters += (i ? "," : "") + sdSlider.value;
    //                     }
    //                 );
    //             }
    //             customTransformList.push(customTransform);
    //             // console.log(customTransform);
    //             lastInnerHTML.push(leftCodeDiv.innerHTML);
    //             let htmlLine = "context." + customTransform[0] + "(" + parameters + ");";
    //             leftCodeDiv.innerHTML += `<span class="c-one">${htmlLine}</span><br/>`;
    //         }
    //     };

    //     deleteButton.onclick = function () {
    //         if (customTransformList.length > 0) {
    //             customTransformList.pop();
    //             leftCodeDiv.innerHTML = lastInnerHTML.pop();
    //         }
    //     };

    //     runButton.onclick = function () {
    //         // hide the sliders and reverse toggle
    //         hideSliders(customCommand);
    //         hideDirTog(customTransformList);
    //         // reset the drop down menu
    //         select.options[0].selected = true;
    //         // in case the user keeps clicking run
    //         if (running) {
    //             leftCodeDiv.innerHTML = "";
    //             rightCodeDiv.innerHTML = "";
    //             reset();
    //         }
    //         // if there is a valid transforamtion list
    //         if (customTransformList.length > 0) {
    //             run(customTransformList);
    //             leftPanel.style.display = "block"; // show the panels
    //             rightPanel.style.display = "block";
    //             // in case the user clicks add when an example is running
    //             addButton.disabled = true;
    //             deleteButton.disabled = true;
    //             select.disabled = true;
    //             running = true;
    //         }
    //         // console.log(customTransformList);
    //     };

    //     resetButton.onclick = function () {
    //         // reset the drop down menu
    //         select.options[0].selected = true;
    //         // clear the code divisions
    //         leftCodeDiv.innerHTML = "";
    //         rightCodeDiv.innerHTML = "";
    //         // hide the sliders if there are any
    //         hideSliders(customCommand);
    //         leftPanel.style.display = "none";
    //         rightPanel.style.display = "none";
    //         // reset reverse toggle
    //         dirTog.checked = false;
    //         // enable the button
    //         addButton.disabled = false;
    //         deleteButton.disabled = false;
    //         select.disabled = false;
    //         // reset these if it is running
    //         if (running) {
    //             reset();
    //             running = false;
    //         }
    //         // clear the transformation parameters
    //         customCommand = undefined;
    //         customTransformList = [];
    //     };

    //     select.onchange = function () {
    //         let command = select.options[select.selectedIndex].text;
    //         // hide the sliders if there are any
    //         hideSliders(customCommand);
    //         // create sliders and transformation command based on the selected option
    //         if (command == "translate") {
    //             // each slider corresponds to a parameter
    //             let translateX = createSlider("translateX: ", -50, 50, 0, 5);
    //             translateX.id = canvasName + "-tX";
    //             let translateY = createSlider("translateY: ", -50, 50, 0, 5);
    //             translateY.id = canvasName + "-tY";
    //             // store the sliders to a custom command
    //             customCommand = { name: "translate", sliders: [translateX, translateY] };
    //         } else if (command == "scale") {
    //             let scaleX = createSlider("scaleX: ", 0, 3, 1, 0.5);
    //             scaleX.id = canvasName + "-sX";
    //             let scaleY = createSlider("scaleY: ", 0, 3, 1, 0.5);
    //             scaleY.id = canvasName + "-sY";
    //             customCommand = { name: "scale", sliders: [scaleX, scaleY] };
    //         } else if (command == "rotate") {
    //             let rotate = createSlider("angle: ", -180, 180, 0, 5);
    //             rotate.id = canvasName + "-rotate";
    //             customCommand = { name: "rotate", sliders: [rotate] };
    //         } else if (command == "fillRect") {
    //             let posX = createSlider("posX: ", -50, 50, 0, 10);
    //             posX.id = canvasName + "-pX";
    //             let posY = createSlider("posY: ", -50, 50, 0, 10);
    //             posY.id = canvasName + "-pY";
    //             let sizeX = createSlider("sizeX: ", 0, 100, 0, 10);
    //             sizeX.id = canvasName + "-sizeX";
    //             let sizeY = createSlider("sizeY: ", 0, 100, 0, 10);
    //             sizeY.id = canvasName + "-sizeY";
    //             customCommand = { name: "fillRect", sliders: [posX, posY, sizeX, sizeY] };
    //         } else if (command == "save") {
    //             customCommand = { name: "save"};
    //         } else if (command == "restore") {
    //             customCommand = { name: "restore"};
    //         } else {
    //             // bad transforamtion command
    //             customCommand = undefined;
    //         }
    //         // if a valid command, show related input sliders
    //         if (customCommand && customCommand.sliders) {
    //             customCommand.sliders.forEach(
    //                 /**
    //                  * @param {HTMLDivElement} sd
    //                  */
    //                 function (sd) {
    //                     customDiv.appendChild(sd);
    //                     sd.style.display = "block";
    //                 }
    //             );
    //         }
    //     };
    // }
    return exampleDiv;
}

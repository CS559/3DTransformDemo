/*jshint esversion: 6 */
// @ts-check

/**
 * Minimal Starter Code for the QuadCopter assignment
 */

import * as T from "./THREE/src/Three.js";
import { OrbitControls } from "./THREE/examples/jsm/controls/OrbitControls.js";
import { onWindowOnload } from "./Libs/helpers.js";
import { Material, Vector3 } from "./THREE/src/Three.js";

let bodyColor = "#ffe014";
let propColor = "#db4116";
let feelerColor = "#dbe36f";
let dishColor = "#20c8e6";
let groundColor = "#4f8cd1";

function quadcopter() {
    let renderer = new T.WebGLRenderer();
    renderer.setSize(600, 400);
    document.body.appendChild(renderer.domElement);

    let scene = new T.Scene();
    let camera = new T.PerspectiveCamera(40, renderer.domElement.width / renderer.domElement.height, 1, 1000);

    camera.position.z = 10;
    camera.position.y = 5;
    camera.position.x = 5;
    camera.lookAt(0, 0, 0);

    // since we're animating, add OrbitControls
    let controls = new OrbitControls(camera, renderer.domElement);

    scene.add(new T.AmbientLight("white", 0.2));

    // two lights - both a little off white to give some contrast
    let dirLight1 = new T.DirectionalLight(0xF0E0D0, 1);
    dirLight1.position.set(1, 1, 0);
    scene.add(dirLight1);

    let dirLight2 = new T.DirectionalLight(0xD0E0F0, 0.7);
    dirLight2.position.set(0, 1, -0.2);
    scene.add(dirLight2);

    let dirLight3 = new T.DirectionalLight(0xD0E0F0, 0.7);
    dirLight3.position.set(1, 0, -0.2);
    scene.add(dirLight3);

    // make a ground plane
    let groundBox = new T.BoxGeometry(10, 0.1, 10);
    let groundMesh = new T.Mesh(groundBox, new T.MeshStandardMaterial({ color: groundColor, roughness: 0.9 }));
    // put the top of the box at the ground level (0)
    groundMesh.position.y = -0.05;
    scene.add(groundMesh);

    // this is the part the student should change
    //** GET RID OF THIS SILLY DONUT! Replace it with an aircraft*/

    let pair1 = new T.Group();
    let pair2 = new T.Group();

    let qc = drawQC();
    let qc2 = drawQC();
    qc.position.set(1, 2, 1);
    qc2.position.set(2, 0.5, 2);
    pair1.add(qc);
    pair2.add(qc2);

    let radar = drawRadar();
    let radar2 = drawRadar();
    radar.position.set(0, 0, 0);
    radar2.position.set(0, 0, 0);
    pair1.add(radar);
    pair2.add(radar2);

    pair1.position.set(-2, 0, 2);
    pair2.position.set(2, 0, -2);
    scene.add(pair1);
    scene.add(pair2);

    let desX = -5 + Math.random() * 10;
    let desY = 1 + Math.random() * 2;
    let desZ = -5 + Math.random() * 10;
    let spot = new T.SpotLight("white");
    spot.rotateY(Math.PI / 2);
    spot.position.set(desX, desY, desZ);
    scene.add(spot);

    let spotHelper = new T.SpotLightHelper(spot);
    scene.add(spotHelper);


    let dx = spot.position.x - 2 - 2;
    let dy = spot.position.y - 0.5;
    let dz = spot.position.z - 2 + 2;
    let move = new T.Vector3(dx, dy, dz);
    move = move.normalize();

    let prevTheta = 0;
    let timer = 0;
    let reached = 0;
    function animateLoop() {
        //** EXAMPLE CODE - STUDENT SHOULD REPLACE */
        // move in a circle 
        let theta = performance.now() / 1000;
        let x = 3 * Math.cos(theta);
        let z = 3 * Math.sin(theta);
        qc.position.x = x;
        qc.position.z = z;
        // let angle = Math.atan2(-z, x);
        // qc.rotation.set(0, angle, 0);
        qc.rotateY(prevTheta - theta);

        let dir = new T.Vector3(-2 - qc.position.x, qc.position.y, 2 - qc.position.z);
        // console.log(dir);
        radar.lookAt(dir);

        if (timer <= 50) {
            qc2.lookAt(spot.position);
        } else if (!reached) {
            let pos = new T.Vector3(qc2.position.x + 2, qc2.position.y, qc2.position.z - 2);
            if (spot.position.distanceTo(pos) < 0.05) {
                reached = 1;
            }
            qc2.position.x += 0.02 * move.x;
            qc2.position.y += 0.02 * move.y;
            qc2.position.z += 0.02 * move.z;
        } else {
            qc2.lookAt(new Vector3(spot.position.x, qc2.position.y, spot.position.z));
            if (qc2.position.y > 0.25) {
                qc2.position.y -= 0.01;
            }
        }

        let dir2 = new T.Vector3(2 - qc2.position.x, 6 - qc2.position.y, -2 - qc2.position.z);
        // console.log(dir);
        radar2.lookAt(dir2);

        prevTheta = theta;
        timer++;
        renderer.render(scene, camera);
        window.requestAnimationFrame(animateLoop);
    }
    animateLoop();
}

function drawQC() {
    let qc = new T.Group();
    let bodyGeom = new T.SphereGeometry(0.3, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    let bodyMaterial = new T.MeshStandardMaterial({ color: bodyColor });
    bodyMaterial.side = T.DoubleSide;
    let bodyMesh = new T.Mesh(bodyGeom, bodyMaterial);
    qc.add(bodyMesh);

    let tailGeom = new T.SphereGeometry(0.4, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    let tailMesh = new T.Mesh(tailGeom, bodyMaterial);
    tailMesh.position.set(0, 0, -0.4);
    qc.add(tailMesh);

    let headGeom = new T.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    let headMesh = new T.Mesh(headGeom, bodyMaterial);
    headMesh.position.set(0, 0, 0.3);
    qc.add(headMesh);

    let leg1Geom = new T.CylinderGeometry(0.04, 0.02, 0.5, 8, 6, false, 0, Math.PI * 2);
    let legMateraial = new T.MeshStandardMaterial({ color: bodyColor });
    let leg1Mesh = new T.Mesh(leg1Geom, legMateraial);
    leg1Mesh.position.set(0.2, 0, 0.4);
    leg1Mesh.rotateZ(Math.PI / 3);
    leg1Mesh.rotateX(-Math.PI / 8);
    qc.add(leg1Mesh);

    let leg2Geom = new T.CylinderGeometry(0.04, 0.02, 0.5, 8, 6, false, 0, Math.PI * 2);
    let leg2Mesh = new T.Mesh(leg2Geom, legMateraial);
    leg2Mesh.position.set(-0.2, 0, 0.4);
    leg2Mesh.rotateZ(-Math.PI / 3);
    leg2Mesh.rotateX(-Math.PI / 8);
    qc.add(leg2Mesh);

    let leg3Geom = new T.CylinderGeometry(0.04, 0.02, 0.57, 8, 6, false, 0, Math.PI * 2);
    let leg3Mesh = new T.Mesh(leg3Geom, legMateraial);
    leg3Mesh.position.set(0.4, 0, -0.7);
    leg3Mesh.rotateZ(Math.PI / 3);
    leg3Mesh.rotateX(Math.PI / 8);
    qc.add(leg3Mesh);

    let leg4Geom = new T.CylinderGeometry(0.04, 0.02, 0.57, 8, 6, false, 0, Math.PI * 2);
    let leg4Mesh = new T.Mesh(leg4Geom, legMateraial);
    leg4Mesh.position.set(-0.4, 0, -0.7);
    leg4Mesh.rotateZ(-Math.PI / 3);
    leg4Mesh.rotateX(Math.PI / 8);
    qc.add(leg4Mesh);

    let spinMaterial = new T.MeshStandardMaterial({ color: propColor });
    let posXs = [0.4, -0.4, 0.6, -0.6];
    let posZs = [0.5, 0.5, -0.8, -0.8];
    let propellers = [];
    for (let i = 0; i < 4; i++) {
        let propeller = new T.Group();
        for (let j = 0; j < 4; j++) {
            let spGeom = new T.BoxGeometry(0.07, 0.03, 0.6);
            let spMesh = new T.Mesh(spGeom, spinMaterial);
            spMesh.rotateY(Math.PI * j / 2);
            propeller.add(spMesh);
        }
        propeller.position.y = -0.12;
        propeller.position.x = posXs[i];
        propeller.position.z = posZs[i];
        if (i < 2) {
            propeller.scale.z = 0.8;
        }

        let ringGeom = new T.TorusGeometry(0.35, 0.03, 16, 100, Math.PI * 2);
        if (i < 2) {
            ringGeom = new T.TorusGeometry(0.3, 0.03, 16, 100, Math.PI * 2);
        }
        let ringMaterial = new T.MeshStandardMaterial({ color: propColor });
        let ringMesh = new T.Mesh(ringGeom, ringMaterial);
        ringMesh.position.y = -0.12;
        ringMesh.position.x = posXs[i];
        ringMesh.position.z = posZs[i];

        ringMesh.rotateX(Math.PI / 2);
        qc.add(ringMesh);
        qc.add(propeller);
        propellers.push(propeller);
    }

    let feeler1Geom = new T.TorusGeometry(0.35, 0.02, 16, 100, Math.PI / 3);
    let feelerMaterial = new T.MeshStandardMaterial({ color: feelerColor });
    let feeler1Mesh = new T.Mesh(feeler1Geom, feelerMaterial);
    feeler1Mesh.position.set(0.25, 0.1, 0.7);
    feeler1Mesh.rotateY(Math.PI * 0.7);
    qc.add(feeler1Mesh);

    let feeler2Geom = new T.TorusGeometry(0.35, 0.02, 16, 100, Math.PI / 3);
    let feeler2Mesh = new T.Mesh(feeler2Geom, feelerMaterial);
    feeler2Mesh.position.set(-0.25, 0.1, 0.7);
    feeler2Mesh.rotateY(Math.PI * 0.3);
    qc.add(feeler2Mesh);

    let prevTheta = 0;
    function animate() {
        //** EXAMPLE CODE - STUDENT SHOULD REPLACE */
        // move in a circle 
        let theta = performance.now() / 1000;
        for (let i = 0; i < propellers.length; i++) {
            propellers[i].rotateY(3 * (prevTheta - theta));
        }
        prevTheta = theta;
        window.requestAnimationFrame(animate);
    }
    animate();

    return qc;
}

function drawRadar() {
    let radar = new T.Group();

    let supGeom = new T.SphereGeometry(0.2);
    let radarMaterial = new T.MeshStandardMaterial({ color: dishColor });
    radarMaterial.side = T.DoubleSide;
    let supMesh = new T.Mesh(supGeom, radarMaterial);
    supMesh.position.y = 0.1;
    radar.add(supMesh);

    let dishGeom = new T.SphereGeometry(1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 4);
    let dishMesh = new T.Mesh(dishGeom, radarMaterial);
    dishMesh.position.y = 1.2;
    dishMesh.rotateX(Math.PI);
    radar.add(dishMesh);

    let coneGeom = new T.ConeGeometry(0.25, 0.7);
    let coneMesh = new T.Mesh(coneGeom, radarMaterial);
    coneMesh.position.y = 0.65;
    radar.add(coneMesh);

    return radar;
}

onWindowOnload(quadcopter);

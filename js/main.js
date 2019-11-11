import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    BoxBufferGeometry,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    MeshPhongMaterial,
    Vector3,
    Geometry,
    Face3,
    BoxGeometry,
    Light,
    Object3D,
    CameraHelper,
    MeshBasicMaterial,
    PlaneGeometry,
    Fog
} from './lib/three.module.js';

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';

import Skybox from "./terrain/Skybox.js";
//import Grass from "./terrain/Grass.js";
import Sun from "./terrain/Sun.js";
import Moon from "./terrain/Moon.js";

const scene = new Scene();

//-------------------------------------SUN------------------------------------------------------------------
let sun = new Sun({textureMap: 0xffff99, radius: 10, height: 60, width: 40});
sun.position.set(0, 420, 0);
let sunOrbit = new Object3D();
sunOrbit.position.set(0, 0, 0);
scene.add(sunOrbit);
sunOrbit.add(sun);
//-----------------------------------MOON--------------------------------------------------------------------
let moonTexture = new TextureLoader().load('resources/textures/moonmap1k.jpg');
let moon = new Moon({textureMap: moonTexture, radius: 3, height: 60, width: 40});
moon.position.set(0, -420, 0);
moon.rotateX(90);
sunOrbit.add(moon);

//-------------------------CAMERA-----------------------------------------------------------------
const camera = new PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new WebGLRenderer();
renderer.setClearColor(0xffffff);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;

/**
 * Handle window resize:
 *  - update aspect ratio.
 *  - update projection matrix
 *  - update renderer size
 */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

/**
 * Add canvas element to DOM.
 */
document.body.appendChild(renderer.domElement);

//-------------------SUNLIGHT--------------------------
let sunLight = new DirectionalLight(0xffffff, 1);

sunLight.castShadow = true;

//Set up shadow properties for the light
sunLight.shadow.mapSize.width = 512;  // default
sunLight.shadow.mapSize.height = 512; // default
sunLight.shadow.camera.near = 0.5;    // default
sunLight.shadow.camera.far = 500;     // default

//---------------------FOG--------------------------------
{
let color = 0xdddddd;
let near = 0.1;
let far = 500;
scene.fog = new Fog(color, near, far);
}
//------------------SKYBOX----------------------------
const skyTexture = new TextureLoader().load('resources/textures/skybox.jpg');
const skybox = new Skybox({textureMap: skyTexture, radius: 500, widthSegments: 60, heightSegments: 40});
scene.add(skybox);

//---------------CUBE OBJECT--------------------------------------
const geometry = new BoxBufferGeometry(0, 0, 0);
const material = new MeshPhongMaterial({ color: 0xffdd11, reflectivity: 0.8 });
const triforce = new Mesh(geometry, material);

triforce.castShadow = true;
triforce.position.set(0, 25, 0);

sunLight.target = triforce;

camera.position.z = 10;
camera.position.y = 25;

//---------------------TRIFORCE----------------------------
/*
const createTriangle = ({x=0, y=0} = {})=>{
    const geo = new Geometry();
    geo.vertices.push(new Vector3(-1, 1.5, 0));
    geo.vertices.push(new Vector3(-0.5, 0.5, 0));
    geo.vertices.push(new Vector3(-1.5, 0.5, 0));
    geo.vertices.push(new Vector3(-1, 1.5, 0.2));
    geo.vertices.push(new Vector3(-0.5, 0.5, 0.2));
    geo.vertices.push(new Vector3(-1.5, 0.5, 0.2));
    geo.faces.push(new Face3(0,1,2));
    geo.faces.push(new Face3(3,4,5));

    geo.faces.push(new Face3(0,1,4));
    geo.faces.push(new Face3(0,3,4));

    geo.faces.push(new Face3(0,2,3));
    geo.faces.push(new Face3(2,3,5));

    geo.faces.push(new Face3(1,2,4));
    geo.faces.push(new Face3(2,4,5));

    geo.computeFaceNormals();
    const triangle = new Mesh(geo, material);

    triforce.add(triangle);
    triangle.position.x = x;
    triangle.position.y = y;
};

createTriangle({x:1, y:0});
createTriangle({x:0.5, y:-1});
createTriangle({x:1.5, y:-1});
*/

scene.add(triforce);

/**
 * Add terrain:
 * 
 * We have to wait for the image file to be loaded by the browser.
 * We pass a callback function with the stuff we want to do once the image is loaded.
 * There are many ways to handle asynchronous flow in your application.
 * An alternative way to handle asynchronous functions is async/await
 *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 */
Utilities.loadImage('resources/images/heightmap.png').then((heightmapImage) => {

    const width = 100;

    const terrainGeometry = new TerrainBufferGeometry({
        width,
        heightmapImage,
        numberOfSubdivisions: 128,
        height: 40
    });

    // const terrainMaterial = new MeshPhongMaterial({
    //     color: 0x777777
    // });



    const grassTexture = new TextureLoader().load('resources/textures/grass_01.jpg');
    grassTexture.wrapS = RepeatWrapping;
    grassTexture.wrapT = RepeatWrapping;
    grassTexture.repeat.set(1000/width, 1000/width);

    const snowyRockTexture = new TextureLoader().load('resources/textures/snowy_rock_01.png');
    snowyRockTexture.wrapS = RepeatWrapping;
    snowyRockTexture.wrapT = RepeatWrapping;
    snowyRockTexture.repeat.set(1500/width, 1500/width);


    const splatMap = new TextureLoader().load('resources/images/splatmap_01.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0x777777,
        shininess: 0,
        textures: [snowyRockTexture, grassTexture],
        splatMaps: [splatMap],
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    terrain.castShadow = true;
    terrain.receiveShadow = true;

    scene.add(terrain);

});

//---------------------WATER----------------------

/**
 * Set up camera controller:
 */

const mouseLookController = new MouseLookController(camera);

// We attach a click lister to the canvas-element so that we can request a pointer lock.
// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
const canvas = renderer.domElement;

canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
});

let yaw = 0;
let pitch = 0;
const mouseSensitivity = 0.001;

function updateCamRotation(event) {
    yaw += event.movementX * mouseSensitivity;
    pitch += event.movementY * mouseSensitivity;
}

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        canvas.addEventListener('mousemove', updateCamRotation, false);
    } else {
        canvas.removeEventListener('mousemove', updateCamRotation, false);
    }
});

let move = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 0.01
};

let pause = false;
window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') {
        move.forward = true;
        e.preventDefault();
    } else if (e.code === 'KeyS') {
        move.backward = true;
        e.preventDefault();
    } else if (e.code === 'KeyA') {
        move.left = true;
        e.preventDefault();
    } else if (e.code === 'KeyD') {
        move.right = true;
        e.preventDefault();
    }else if ((e.code === "KeyF") && (pause === false)){
        pause = true;
    }else if ((e.code === "KeyF") && (pause === true)){
        pause = false;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') {
        move.forward = false;
        e.preventDefault();
    } else if (e.code === 'KeyS') {
        move.backward = false;
        e.preventDefault();
    } else if (e.code === 'KeyA') {
        move.left = false;
        e.preventDefault();
    } else if (e.code === 'KeyD') {
        move.right = false;
        e.preventDefault();
    }
});



// // instantiate a loader
// const loader = new OBJLoader();

// // load a resource
// loader.load(
//     // resource URL
//     'resources/models/sofa.obj',
//     // called when resource is loaded
//     function (object) {
//         scene.add(object);
//     },
//     // called when loading is in progresses
//     function (xhr) {

//         console.log((xhr.loaded / xhr.total * 100) + '% loaded');

//     },
//     // called when loading has errors
//     function (error) {

//         console.log('An error happened');

//     }
// );

const velocity = new Vector3(0.0, 0.0, 0.0);

let then = performance.now();
//Position variables
let moonBool = false;
let moonPos = new Vector3();
let sunPos = new Vector3();
//Color variables
let g = "ff";
let b = "ff";
let rgb;
function loop(now) {

    const delta = now - then;
    then = now;

    const moveSpeed = move.speed * delta * 10;

    velocity.set(0.0, 0.0, 0.0);

    if (move.left) {
        velocity.x -= moveSpeed;
    }

    if (move.right) {
        velocity.x += moveSpeed;
    }

    if (move.forward) {
        velocity.z -= moveSpeed;
    }

    if (move.backward) {
        velocity.z += moveSpeed;
    }

    // update controller rotation.
    mouseLookController.update(pitch, yaw);
    yaw = 0;
    pitch = 0;

    // apply rotation to velocity vector, and translate moveNode with it.

    velocity.applyQuaternion(camera.quaternion);
    camera.position.add(velocity);


    // animate cube rotation:
    triforce.rotation.x += 0.01;
    triforce.rotation.y += 0.01;

    if(pause === false) {
        //orbital speed for sun and moon
        sunOrbit.rotation.x += 0.001;
    }

    //rotation for moon
    moon.rotation.y += 0.1;

    //light checks for sun and moon
    moonPos.setFromMatrixPosition(moon.matrixWorld);
    sunPos.setFromMatrixPosition(sun.matrixWorld);
    if ((moonPos.y < 0) && (moonBool === false)){
        moon.remove(sunLight);
        sunLight.position.set(0,0,0);
        sunLight.color.setHex(0xffffff);
        sun.add(sunLight);
        moonBool = true;
    }
    if ((moonPos.y >= 0) && (moonBool === true)){
        sun.remove(sunLight);
        sunLight.position.set(0,0,0);
        sunLight.color.setHex(0x9999ff);
        moon.add(sunLight);
        moonBool = false;
    }

    //Regulating the intensity of the light to simulate more realistic day/night cycle
    if(moonBool === true){
        sunLight.intensity = (sunPos.y/2100)+0.2;
        //Creating a sunset and sunrise color.
        b = Math.floor((128+(255*(sunPos.y/840)))).toString(16);
        g = Math.floor((170+(255*(sunPos.y/1260)))).toString(16);
        rgb = "0xff"+g+b;
        sunLight.color.setHex(rgb);
    }else{
        sunLight.intensity = (moonPos.y/2100)+0.2;
    }

    // render scene:
    renderer.render(scene, camera);

    requestAnimationFrame(loop);

}

loop(performance.now());
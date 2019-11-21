import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    Vector3,
    Vector2,
    Object3D,
    Fog,
    Raycaster,
    UniformsUtils,
    MirroredRepeatWrapping,
    LoadingManager,
} from './lib/three.module.js';
import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './materials/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './terrain/TerrainBufferGeometry.js';

import Skybox from "./terrain/Skybox.js";
import Grass from "./terrain/Grass.js";
import Sun from "./terrain/Sun.js";
import Moon from "./terrain/Moon.js";
import Water from "./terrain/Water.js";
import LODobject from "./terrain/LODobject.js";
import OBJLoader from "./loaders/OBJLoader.js";
import MTLLoader from "./loaders/MTLLoader.js";

let loadingManager = new LoadingManager();

// Models index
let models = {
    tree: {
        obj:"resources/models/lowpolytree.obj",
        mtl:"resources/models/lowpolytree.mtl",
        mesh: null
    },
};

// function modelLoad(){
//     console.log("in modelLoad")
for( let _key in models ){
    (function(key){

        let mtlLoader = new MTLLoader(loadingManager);
        mtlLoader.load(models[key].mtl, function(materials){
            materials.preload();

            let objLoader = new OBJLoader(loadingManager);

            objLoader.setMaterials(materials);
            objLoader.load(models[key].obj, function(mesh){

                mesh.traverse(function(node){
                    if( node instanceof Mesh ){
                        node.castShadow = true;
                        node.receiveShadow = true;
                    }
                });
                models[key].mesh = mesh;

            });
        });

    })(_key);
}
// }

let RESOURCES_LOADED = false;
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


loadingManager.onLoad = function(){
    console.log("loaded all resources");
    RESOURCES_LOADED = true;
    //onResourcesLoaded();
    //modelLoad();
}

/**
 * Add canvas element to DOM.
 */
document.body.appendChild(renderer.domElement);

camera.position.z = 10;
camera.position.y = 25;

//-------------------SUNLIGHT--------------------------
let sunLight = new DirectionalLight(0xffffff, 1);

sunLight.castShadow = true;

//Set up shadow properties for the light
sunLight.shadow.mapSize.width = 512;  // default
sunLight.shadow.mapSize.height = 512; // default
sunLight.shadow.camera.near = 0.5;    // default
sunLight.shadow.camera.far = 500;     // default

//---------------------FOG--------------------------------

let dayColor = 0xdddddd;
let nightColor = 0x000000;
let fognear = 0.1;
let fogfar = 500;
scene.fog = new Fog(dayColor, fognear, fogfar);

//------------------SKYBOX----------------------------
const skyTexture = new TextureLoader().load('resources/textures/skybox.jpg');
const skybox = new Skybox({textureMap: skyTexture, radius: 500, widthSegments: 60, heightSegments: 40});

const nightTexture = new TextureLoader().load("resources/textures/skyboxNight.jpg");
const nightbox = new Skybox({textureMap: nightTexture, radius: 500, widthSegments: 60, heightSegments: 40});

//---------------LOD OBJECT--------------------------------------
const LODbox = new LODobject(0xffdd11);
sunLight.target = LODbox;
scene.add(LODbox);

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
        height: 20
    });

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

    //--------------GRASS----------------------------------

    let GrassTexture = new TextureLoader().load('resources/textures/Grassbillboardtexture.png');

    let x;
    let z;

    function makeGrass(grass){
        x = Math.floor(Math.random()*49) + 1;
        x *= Math.floor(Math.random()*2) === 1 ? 1 : -1;
        z = Math.floor(Math.random()*49) + 1;
        z *= Math.floor(Math.random()*2) === 1 ? 1 : -1;
        const raycaster = new Raycaster();
        const direction = new Vector3(0.0, -1.0, 0.0);
        //const move = new Vector3();
        raycaster.set(new Vector3(x, 150, z), direction);
        let array = raycaster.intersectObject(terrain);
        if(array[0].point.y<25 || array[0].point.y>5) {
            grass.position.set(array[0].point.x, array[0].point.y+0.3, array[0].point.z);
            scene.add(grass);
        }
    }

    for(let i =0; i<200; i++){
        const grass = new Grass({texture:GrassTexture});
        makeGrass(grass);
    }


    //--------------TREES----------------------------------
    // Mesh index
    let meshes = {};

    function makeTrees(){
        let x, z;
        meshes["tree1"] = models.tree.mesh.clone();
        x = Math.floor(Math.random()*49) + 1;
        x *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
        z = Math.floor(Math.random()*49) + 1;
        z *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
        const raycaster = new Raycaster();
        const direction = new Vector3(0.0, -1.0, 0.0);
        raycaster.set(new Vector3(x, 150, z), direction);
        let array = raycaster.intersectObject(terrain);
        if(array[0].point.y<25 || array[0].point.y>5) {
            meshes["tree1"].position.set(array[0].point.x, array[0].point.y+0.3, array[0].point.z);
            meshes["tree1"].scale.set(2,2,2);
            scene.add(meshes["tree1"]);
        }
    }

    for(let i =0; i<10; i++){
        makeTrees();
    }


    terrain.castShadow = true;
    terrain.receiveShadow = true;

    scene.add(terrain);

});

//---------------------WATER----------------------------------------


//Size variables of water
let maxRow = 1000;
let maxCol = 1000;
let segmentRow = 10;
let segmentCol = 10;

//Uniforms declaration
    let angle = [];
    for (let i = 0; i < 8; i++) {
        let a = Math.random() * (2.0942) + (-1.0471);
        angle [i] = new Vector2(Math.cos(a), Math.sin(a));
    }

//Texture for the water
let loader = new TextureLoader();
loader.setCrossOrigin("");
let uniforms;
let waterTexture;
waterTexture = loader.load("resources/textures/water.jpg");
waterTexture.wrapS = MirroredRepeatWrapping;
waterTexture.wrapT = RepeatWrapping;
waterTexture.repeat.set(25, 25);

uniforms = UniformsUtils.merge([
    {
        time: {value: 0.1},
        time2: {value: 0.1},
        texture2: {value: null},
        waterHeight: {value: 0.1},
        amplitude: {value: [0.5, 0.25, 0.17, 0.125, 0.1, 0.083, 0.0714, 0.063]},
        wavelength: {value: [25.133, 12.566, 8.378, 6.283, 5.027, 4.189, 3.590, 3.142]},
        speed: {value: [1.2, 2.0, 2.8, 3.6, 4.4, 5.2, 6.0, 6.8]},
        direction: {value: angle},
        numWaves: {value: 100},
        fogColor: dayColor,
        fogNear: fognear,
        fogFar: fogfar,
    }
]);
uniforms.texture2.value = waterTexture;
let oceanPosition = new Vector3(0, -5, 0);
let ocean = new Water(maxRow, maxCol, segmentRow, segmentCol, uniforms, oceanPosition);
scene.add(ocean);

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
let renderPause = false;
let cameraArc = false;
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
    }else if ((e.code === "KeyZ") && (renderPause === false)){
        renderPause = true;
    }else if ((e.code === "KeyZ") && (renderPause === true)){
        renderPause = false;
        loop(performance.now());
    }else if ((e.code === "KeyM") && (cameraArc === false)){
        cameraArc = true;
    }else if ((e.code === "KeyM") && (cameraArc === true)){
        cameraArc = false;
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
// const modelLoader = new OBJLoader();
//
// // load a resource
// modelLoader.load(
//     // resource URL
//     'resources/models/sofa.obj',
//     // called when resource is loaded
//     function (object) {
//         let material, mesh;
//         material = new MeshBasicMaterial(object)
//         mesh = new Mesh(object, material)
//
//         scene.add(mesh);
//     },
//     // called when loading is in progresses
//     function (xhr) {
//
//         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//
//     },
//     // called when loading has errors
//     function (error) {
//
//         console.log('An error happened');
//
//     }
// );

const velocity = new Vector3(0.0, 0.0, 0.0);

let then = performance.now();
let time = 0;
//Position variables for moon and sun
let moonBool = false;
let moonPos = new Vector3();
let sunPos = new Vector3();
//Color variables for sunlight
let g = "ff";
let b = "ff";
let rgb;
//Color variables for skybox
let rs = "ff";
let bs = "ff";
let gs = "ff";
let rgbs;
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


    // animate cube rotation:
    LODbox.rotation.x += 0.01;
    LODbox.rotation.y += 0.01;
    LODbox.update(camera);

    if (pause === false) {
        //orbital speed for sun and moon
        sunOrbit.rotation.x += 0.001;
    }

    //rotation for moon
    moon.rotation.y += 0.1;

    //light checks for sun and moon
    moonPos.setFromMatrixPosition(moon.matrixWorld);
    sunPos.setFromMatrixPosition(sun.matrixWorld);
    if ((moonPos.y < 0) && (moonBool === false)) {
        moon.remove(sunLight);
        sunLight.position.set(0, 0, 0);
        sunLight.color.setHex(0xffffff);
        sun.add(sunLight);
        moonBool = true;

        scene.add(skybox);
        scene.remove(nightbox);

        scene.fog.color.setHex(dayColor);
        ocean.material.uniforms.fogColor.value = dayColor;
    }
    if ((moonPos.y >= 0) && (moonBool === true)) {
        sun.remove(sunLight);
        sunLight.position.set(0, 0, 0);
        sunLight.color.setHex(0x9999ff);
        moon.add(sunLight);
        moonBool = false;

        scene.remove(skybox);
        scene.add(nightbox);

        scene.fog.color.setHex(nightColor);
        ocean.material.uniforms.fogColor.value = nightColor;
    }

    //Regulating the intensity of the light to simulate more realistic day/night cycle
    if (moonBool === true) {
        sunLight.intensity = (sunPos.y / 2100) + 0.2;

        //Changing color of skybox and fog with day/night cycle
        rs = gs = bs = Math.floor(((255 * ((sunPos.y) / 420)))).toString(16);
        if(rs.length < 2){
            rs = gs = bs = "0"+rs;
        }
        rgbs = "0x"+rs+gs+bs;
        skybox.material.color.setHex(rgbs);
        scene.fog.color.setHex(rgbs);

        //Creating a sunset and sunrise color.
        b = Math.floor((128 + (255 * (sunPos.y / 840)))).toString(16);
        g = Math.floor((170 + (255 * (sunPos.y / 1260)))).toString(16);
        rgb = "0xff" + g + b;
        sunLight.color.setHex(rgb);
    } else {
        //Darkens skybox nighttime for smoother transition.
        rs = gs = bs = Math.floor(((255 * ((moonPos.y) / 420)))).toString(16);
        if(rs.length < 2){
            rs = gs = bs = "0"+rs;
        }
        rgbs = "0x"+rs+gs+bs;
        nightbox.material.color.setHex(rgbs);
    }

    //Animating water
    ocean.material.uniforms.time.value += 0.001;
    ocean.material.uniforms.time2.value += 0.004;

    // apply rotation to velocity vector, and translate moveNode with it.
    time += 0.0005;
    if(cameraArc === false) {
        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);
    }else if(cameraArc === true){
        camera.position.x = LODbox.position.x + 200 * Math.cos( 3.14159 * time );
        camera.position.z = LODbox.position.z + 200 * Math.sin( 3.14159 * time );
        camera.lookAt(LODbox.position);
    }


    // render scene:
    renderer.render(scene, camera);

    if (renderPause === false) {
        requestAnimationFrame(loop);
    }
}

loop(performance.now());
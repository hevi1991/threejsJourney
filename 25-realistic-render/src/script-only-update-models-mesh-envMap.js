import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Update all materials

const updateAllMaterials = () => {
    /*
    traverse
    以一个object3D对象作为第一个参数的函数。
    在对象以及后代中执行的回调函数。
    */
    scene.traverse((child) => {
        if (
            child instanceof THREE.Mesh &&
            child.material instanceof THREE.MeshStandardMaterial
        ) {
            child.material.envMap = environmentMap; // 使用envMap的环境光
            child.material.envMapIntensity = debugObject.envMapIntensity;
        }
    });
};
/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    // p: 正 n: 负 xyz
    "/textures/environmentMaps/0/px.jpg",
    "/textures/environmentMaps/0/nx.jpg",
    "/textures/environmentMaps/0/py.jpg",
    "/textures/environmentMaps/0/ny.jpg",
    "/textures/environmentMaps/0/pz.jpg",
    "/textures/environmentMaps/0/nz.jpg",
]);
scene.background = environmentMap; // set envmap for scene
debugObject.envMapIntensity = 5;
gui.add(debugObject, "envMapIntensity", 0, 10, 0.001).onChange(
    updateAllMaterials
);

/**
 * Models
 */
gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.position.set(0, -4, 0);
    gltf.scene.rotation.y = Math.PI * 0.5;
    scene.add(gltf.scene);

    gui.addFolder("model")
        .add(gltf.scene.rotation, "y", -Math.PI, Math.PI, 0.001)
        .name("rotation");

    // 为了更新此模型scene的材质
    updateAllMaterials();
});

/**
 * Lights
 */
const directionLight = new THREE.DirectionalLight("#ffffff", 3);
directionLight.position.x = 0.25;
directionLight.position.y = 3;
directionLight.position.z = -2.25;
scene.add(directionLight);

const lightFolder = gui.addFolder("direction light");
lightFolder.add(directionLight, "intensity", 0, 10, 0.001);
lightFolder.add(directionLight.position, "x", -5, 5, 0.001);
lightFolder.add(directionLight.position, "y", -5, 5, 0.001);
lightFolder.add(directionLight.position, "z", -5, 5, 0.001);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true; // 是否使用物理上正确的光照模式，开启之后才能模拟环境光

/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

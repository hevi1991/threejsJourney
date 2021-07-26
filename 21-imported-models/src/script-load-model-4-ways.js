import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const gltfLoader = new GLTFLoader();
/*
- "glTF", 可以自定义修改glTF文件里的内容
- "glTF-Binary", 无法自定义修改内容，但体积最小
- "glTF-Draco", google优化算法后的格式，更轻量，但比较吃客户端性能
- "glTF-Embedded", 所有glTF打包在一个文件下，体积会比glTF大
*/
/* Duck glTF format
gltfLoader.load(
    "/models/Duck/glTF/Duck.gltf",
    (gltf) => {
        // loaded
        // scene.add(gltf.scene);
        scene.add(gltf.scene.children[0]);
    },
    () => {
        console.log("progress");
    },
    (err) => {
        console.error(err);
    }
);
 */

/* binary format
gltfLoader.load("/models/Duck/glTF-Binary/Duck.glb", (gltf) => {
    // loaded
    scene.add(gltf.scene.children[0]);
});
 */

/* embedded gltf format
gltfLoader.load("/models/Duck/glTF-Embedded/Duck.gltf", (gltf) => {
    // loaded
    scene.add(gltf.scene.children[0]);
});
 */

/* draco format 解压比较花性能，视情况选择
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/"); // draco 需要解压库
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load("/models/Duck/glTF-Draco/Duck.gltf", (gltf) => {
    scene.add(gltf.scene);
});
 */

/* 加载复杂模型*/
gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
    // for 循环去取gltf.scene.children，然后直接scene去添加，会添加不完全
    // scene.add(...gltf.scene.children);
    scene.add(gltf.scene); // 直接添加整个组Group
});

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: "#444444",
        metalness: 0,
        roughness: 0.5,
    })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

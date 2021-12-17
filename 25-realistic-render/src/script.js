import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
gltfLoader.setDRACOLoader(dracoLoader);
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
            // child.material.envMap = environmentMap; // 使用envMap
            child.material.envMapIntensity = debugObject.envMapIntensity;
            child.material.needsUpdate = true; // 适配toneMapping生效
            child.castShadow = true;
            child.receiveShadow = true;
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
environmentMap.encoding = THREE.sRGBEncoding; // 使用sRGB编码；GLTFLoader会自动给模型配置好合适的encoding，所以无需手动配置
scene.background = environmentMap; // set envmap for scene
scene.environment = environmentMap; // easy way setting all mesh envMap
debugObject.envMapIntensity = 5;
gui.add(debugObject, "envMapIntensity", 0, 10, 0.001).onChange(
    updateAllMaterials
);

/**
 * Models
 */
gltfLoader.load("/models/hamburger.glb", (gltf) => {
    gltf.scene.scale.set(0.3, 0.3, 0.3);
    gltf.scene.position.set(0, -1, 0);
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
directionLight.castShadow = true;
directionLight.shadow.camera.far = 15;
directionLight.shadow.mapSize.set(1024, 1024);
// directionLight.shadow.bias = 1; // 阴影贴图偏差，在确定曲面是否在阴影中时，从标准化深度添加或减去多少。默认值为0.此处非常小的调整（大约0.0001）可能有助于减少阴影中的伪影
directionLight.shadow.normalBias = 0.05; // 作用和bias一样，修复shadow acne，模型边缘凸起导致的阴影生产，此值可以将凸起压平滑
scene.add(directionLight);

// const directionLightShadowCameraHelper = new THREE.CameraHelper(
//     directionLight.shadow.camera
// );
// scene.add(directionLightShadowCameraHelper);

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
    antialias: true, // 抗锯齿 - 低性能，优化渲染画质
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding; // 使用sRGB编码
/*
toneMapping 色调映射
THREE.NoToneMapping
THREE.LinearToneMapping
THREE.ReinhardToneMapping
THREE.CineonToneMapping
THREE.ACESFilmicToneMapping
这些常量定义了WebGLRenderer中toneMapping的属性。 
这个属性用于在普通计算机显示器或者移动设备屏幕等低动态范围介质上，模拟、逼近高动态范围（HDR）效果。
*/
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

gui.add(renderer, "toneMapping", {
    NoTone: THREE.NoToneMapping,
    LinearTone: THREE.LinearToneMapping,
    ReinhardTone: THREE.ReinhardToneMapping,
    CineonTone: THREE.CineonToneMapping,
    ACESFilmicTone: THREE.ACESFilmicToneMapping,
}).onFinishChange((v) => {
    renderer.toneMapping = ~~v; // threejs的bug，无法直接切换toneMapping；字符串转数字
    updateAllMaterials();
});
gui.add(renderer, "toneMappingExposure", 0, 10, 0.001);

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

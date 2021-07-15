import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Axes helper
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Fonts
 */
const fontLoader = new THREE.FontLoader();
fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
    console.log(`font loaded`);
    const textGeometry = new THREE.TextGeometry("Hello Three.js", {
        font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
    });
    // 移动到坐标中心点
    // 【手动】
    /* textGeometry.computeBoundingBox(); // 想把内容固定到某个位置，需要先计算它的体积盒
    const { bevelSize, bevelThickness } = textGeometry.parameters.options;
    // textGeometry.boundingBox 有max和min的原因，是由于生成的几何体有3维轴且规则不均匀，有负值的情况
    textGeometry.translate(
        // 移动至mesh中心，x,y需要减去bevelSize，z需要减去bevelThickness，才可以移动到中心点
        -(textGeometry.boundingBox.max.x - bevelSize) * 0.5,
        -(textGeometry.boundingBox.max.y - bevelSize) * 0.5,
        -(textGeometry.boundingBox.max.z - bevelThickness) * 0.5
    );
    textGeometry.computeBoundingBox();
    console.log(textGeometry.boundingBox); */
    // 【自动】
    textGeometry.center();

    const textMaterial = new THREE.MeshBasicMaterial();
    textMaterial.wireframe = true;
    const text = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(text);
});

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
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

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

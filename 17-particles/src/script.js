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

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/textures/particles/2.png");

/**
 * Particles
 */
// Geometry
const particlesGeometry = new THREE.BufferGeometry();
const count = 20000;
const positions = new Float32Array(count * 3); // 每三个数，为一个三维坐标点 (x,y,z)
const colors = new Float32Array(count * 3); // 每三个数，为一个rgb (r,g,b)

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10; // 正负数，* 让范围更大一些
    colors[i] = Math.random(); // 0 ~ 1 RGB上下限
}
particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3) // 3个数为一个三维坐标点 (x,y,z)
);
particlesGeometry.setAttribute(
    "color", // 不同颜色需要开启material.vertexColors
    new THREE.BufferAttribute(colors, 3) //// 每三个数，为一个rgb (r,g,b)
);

// material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
});
particlesMaterial.sizeAttenuation = true; // true: 离镜头近会大，远会小
// particlesMaterial.color = new THREE.Color("#ffffff"); // 底色会于粒子色叠加，固注释
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
// 解决particle边角不透明
// particlesMaterial.alphaTest = 0.001; // 方法1，降低黑色的透明渲染（不完全）
// particlesMaterial.depthTest = false; // 方法2，不做深度测试（不完全，多个mesh叠加诱发颗粒穿透的bug）
particlesMaterial.depthWrite = false; // 方法3，（比较推荐）

particlesMaterial.blending = THREE.AdditiveBlending; // 粒子效果叠加
particlesMaterial.vertexColors = true; // 支持粒子多色

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Cube
/* scene.add(
    new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial())
); */

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
camera.position.z = 3;
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

    // Update particles
    // particles.rotation.y = elapsedTime * 0.2;

    // 更新每个粒子
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const y = i3 + 1;

        const x = particlesGeometry.attributes.position.array[i3];
        particlesGeometry.attributes.position.array[y] = Math.sin(
            elapsedTime + x
        );
        // 更加性能流程的动画，需要使用 shader 着色器
    }
    // 必须设置为true才会刷新
    particlesGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

window.onbeforeunload = (e) => {
    console.log(`onbeforeunload`);
    window.cancelAnimationFrame(tick);
};

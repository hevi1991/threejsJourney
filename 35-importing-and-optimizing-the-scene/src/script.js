import "./style.css";
import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400,
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();
// textureLoader.load("/baked.jpg");

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const bakedTexture = textureLoader.load("/baked.jpg");
bakedTexture.flipY = false; // 默认flipY true
bakedTexture.encoding = THREE.sRGBEncoding; // 颜色编码设置为sRGBEncoding，还要配置renderer的颜色编码

/**
 * Materails
 */
// Baked material 默认导入的时候是使用MeshStandardMaterial，这项目不需要自定义光，所以使用MeshBasicMaterial
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
// Portal light material
const portalLightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
});
// Pole light material
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });

/**
 * Model
 * gltf格式导出前，可以合并需要导出的几何体，从而减少渲染时候的drawcall
 */
gltfLoader.load("/portal.glb", (gltf) => {
    // gltf.scene.traverse((child) => {
    //     child.material = bakedMaterial;
    // });

    // 因为优化合并的导出后，只有几个geometry，所以可以不需要traverse赋材质
    // 合并后的场景物体
    gltf.scene.children.find((child) => /^baked$/.test(child.name)).material =
        bakedMaterial;
    // 传送门
    gltf.scene.children.find((child) =>
        /^portalLight/.test(child.name)
    ).material = portalLightMaterial;
    // 路灯
    gltf.scene.children
        .filter((child) => /^poleLight/.test(child.name))
        .forEach((poleLightMesh) => {
            poleLightMesh.material = poleLightMaterial;
        });

    scene.add(gltf.scene);
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
    45,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;

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

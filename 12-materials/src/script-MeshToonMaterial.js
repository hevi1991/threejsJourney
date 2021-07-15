import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/*
Materials are used to put a color on each visible pixel of the geometries
The algorithms are written in programs called shaders
We don't need to write shaders and we can use built-in materials
*/

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
    "/textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");
const matcapTexture = textureLoader.load("/textures/matcaps/3.png");
const gradientTexture = textureLoader.load("/textures/gradients/3.jpg");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects
// const material = new THREE.MeshBasicMaterial();
// 模型网格
// material.wireframe = true;
// 颜色相关
// material.color.set(0x10ff10); // 可以调用color对象的set方法去设置颜色
// material.color = new THREE.Color(0x3399ee); // 也可以重新设置一个THREE.Color对象实例
// 透明需要transparent为真才能显示效果
// material.transparent = true;
// material.opacity = 0.4;
// 纹理
// material.map = doorColorTexture; // 纹理和颜色可以同时存在
// material.alphaMap = doorAlphaTexture; // 如果使用透明纹理，也需要transparent设置为真
// 纹理渲染面
// material.side = THREE.DoubleSide; // 可以选择它的其他枚举

// MeshNormalMaterial 可以接受法线向量的材质，例如光、反射等等
// const material = new THREE.MeshNormalMaterial();
// 划分为片状，片状的区域不会有渐变色
// material.flatShading = true;

// MeshMatcapMaterial 光照球，不会对光作出反应，但可以通过纹理，模仿光照效果的一种材质
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

// MeshDepthMaterial 按深度绘制几何体的材质。深度基于相机远近平面。白色最近，黑色最远。
// const material = new THREE.MeshDepthMaterial();

// MeshLambertMaterial 一种非光泽表面的材质，没有镜面高光。需要AmbientLight和PointLight作为光源
// const material = new THREE.MeshLambertMaterial();

// MeshPhongMaterial 一种用于具有镜面高光的光泽表面的材质。也需要光源，区别MeshLambertMaterial，会显得更光滑，但运行性能稍差一些
// const material = new THREE.MeshPhongMaterial();
// material.shininess = 100; // 高亮的程度
// material.specular = new THREE.Color(0xff0000); // 高光颜色

// MeshToonMaterial 一种卡通着色得材质。也需要光源
const material = new THREE.MeshToonMaterial();
gradientTexture.minFilter = THREE.NearestFilter; // 修改着采样方式
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;
material.gradientMap = gradientTexture; // Gradient map for toon shading. It's required to set Texture.minFilter and Texture.magFilter to THREE.NearestFilter when using this type of texture. Default is null.

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), material);
sphere.position.x = -1.5;
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 16, 32),
    material
);
torus.position.x = 1.5;
scene.add(sphere, plane, torus);

/**
 * Lights 光
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

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

    // Update Objects，让mesh动起来，用于观察变化
    sphere.rotation.y = 0.1 * elapsedTime;
    plane.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    plane.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

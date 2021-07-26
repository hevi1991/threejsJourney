import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import CANNON from "cannon";

/**
 * Debug
 */
const gui = new dat.GUI();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
    "/textures/environmentMaps/0/px.png",
    "/textures/environmentMaps/0/nx.png",
    "/textures/environmentMaps/0/py.png",
    "/textures/environmentMaps/0/ny.png",
    "/textures/environmentMaps/0/pz.png",
    "/textures/environmentMaps/0/nz.png",
]);

/**
 * Physics
 * 物理的世界并不能渲染出来，要让Scene与它同步渲染
 */
// World
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // 重力

// Materials 物体的材质，不同于threejs的，是现实物理性质的材质
const concreteMaterial = new CANNON.Material("concrete"); // 水泥？
const plasticMaterial = new CANNON.Material("plastic"); // 塑料

const concretePlasticContactMaterial = new CANNON.ContactMaterial( // 创造两种材质碰撞的材质表现
    concreteMaterial,
    plasticMaterial,
    {
        friction: 0.1, // 摩擦
        restitution: 0.9, // 复原性
    }
);
world.addContactMaterial(concretePlasticContactMaterial);

// Sphere CANNON的world中添加ShapeBody，类似Scene中添加Mesh
const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: sphereShape,
    material: plasticMaterial, // 赋予塑料材质
});
world.addBody(sphereBody);

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.material = concreteMaterial; // 赋予水泥材质
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2); // 以一个点为圆心，转90°
world.addBody(floorBody);

/**
 * Test sphere
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
    })
);
sphere.castShadow = true;
sphere.position.y = 0.5;
scene.add(sphere);

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: "#777777",
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
    })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
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
camera.position.set(-3, 3, 3);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime; // 上一帧到当前帧的时间
    oldElapsedTime = elapsedTime;

    // Update physics world
    world.step(1 / 60, deltaTime, 3); // 一秒多少帧，上一帧到当前帧的时间，？
    // sphere.position.x = sphereBody.position.x;
    // sphere.position.y = sphereBody.position.y;
    // sphere.position.z = sphereBody.position.z;
    sphere.position.copy(sphereBody.position);

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

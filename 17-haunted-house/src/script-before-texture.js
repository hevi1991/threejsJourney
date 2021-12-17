import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

// 坐标轴1单位视为1米

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Fog 迷雾
const fog = new THREE.Fog("#262837", 1, 15);
scene.fog = fog;

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * House
 */
const house = new THREE.Group(); // 把一同操作的mesh丟到一个group中
scene.add(house);

// Walls 墙
const wallsSize = {
    width: 4, // 长
    height: 2.5, // 高
    depth: 4, // 宽
};
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(wallsSize.width, wallsSize.height, wallsSize.depth),
    new THREE.MeshStandardMaterial({ color: 0xac7e82 })
);
walls.position.y = wallsSize.height / 2;
house.add(walls);

// Roof 屋顶
const roofSize = {
    radius: 3.5,
    height: 1,
    radialSegments: 4,
};
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(
        roofSize.radius,
        roofSize.height,
        roofSize.radialSegments
    ),
    new THREE.MeshStandardMaterial({ color: 0xb35f45 })
);
roof.position.y = wallsSize.height + roofSize.height / 2;
roof.rotation.y = Math.PI / 4; // π 是周长与直径比值，π/4等于45%夹角的周长直径比
house.add(roof);

// Door 门
const doorSize = {
    width: 2,
    height: 2,
};
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(doorSize.width, doorSize.height),
    new THREE.MeshStandardMaterial({ color: "#493838" })
);
door.position.y = doorSize.height / 2;
door.position.z = wallsSize.depth / 2 + 0.01;
house.add(door);

// Bushes 灌木丛
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x89c854 });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.25, 0.25, 0.25);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(-0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
bush4.scale.set(0.15, 0.15, 0.15);
bush4.position.set(-1, 0.05, 2.6);

house.add(bush1, bush2, bush3, bush4);

// Graves 坟墓
const graves = new THREE.Group();
scene.add(graves);

const graveSize = {
    width: 0.6,
    height: 0.8,
    depth: 0.2,
};
const graveGeometry = new THREE.BoxGeometry(
    graveSize.width,
    graveSize.height,
    graveSize.depth
);
const graveMaterial = new THREE.MeshStandardMaterial({ color: "#b2b6b1" });

for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2; // 随机取得它围绕的圆
    const radius = 3 + Math.random() * 6; // 在圆的基础上，再随机它的x和z坐标
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);
    grave.position.set(x, graveSize.height / 2 - 0.1, z);
    grave.rotation.y = (Math.random() - 0.5) * 0.4; // 让它歪歪扭扭
    grave.rotation.z = (Math.random() - 0.5) * 0.4; // 让它歪歪扭扭
    graves.add(grave);
}

// Floor 地面
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: "#a9c388" })
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.12);
moonLight.position.set(4, 5, -2);
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

// Door light
const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
doorLight.position.set(0, 2.2, 2.7);
house.add(doorLight);

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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
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
renderer.setClearColor("#262837"); // 让超出场景的颜色与迷雾一致

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

/*
Exceeded 300 live WebGL contexts for this principal, losing the least recently used one.
*/
window.onbeforeunload = (e) => {
    console.log(`onbeforeunload`);
    window.cancelAnimationFrame(tick);
};

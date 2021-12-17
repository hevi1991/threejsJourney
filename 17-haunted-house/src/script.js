import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";

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
const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
    "/textures/door/ambientOcclusion.jpg"
);
const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");

// brick 砖
const brickAmbientOcclusionTexture = textureLoader.load(
    "/textures/bricks/ambientOcclusion.jpg"
);
const brickColorTexture = textureLoader.load("/textures/bricks/color.jpg");
const brickNormalTexture = textureLoader.load("/textures/bricks/normal.jpg");
const brickRoughnessTexture = textureLoader.load(
    "/textures/bricks/roughness.jpg"
);

// grass 草地
const grassAmbientOcclusionTexture = textureLoader.load(
    "/textures/grass/ambientOcclusion.jpg"
);
const grassColorTexture = textureLoader.load("/textures/grass/color.jpg");
const grassNormalTexture = textureLoader.load("/textures/grass/normal.jpg");
const grassRoughnessTexture = textureLoader.load(
    "/textures/grass/roughness.jpg"
);
grassColorTexture.repeat.set(8, 8);
grassColorTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

// 重复的类型
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

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
    new THREE.MeshStandardMaterial({
        map: brickColorTexture,
        aoMap: brickAmbientOcclusionTexture,
        normalMap: brickNormalTexture,
        roughnessMap: brickRoughnessTexture,
    })
);
walls.geometry.setAttribute(
    "uv2",
    new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
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
    width: 2.2,
    height: 2.2,
};
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(doorSize.width, doorSize.height, 100, 100), // 后两个参数是宽和高的切面数
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true, // 透明设置为true，alphaMap才有效
        alphaMap: doorAlphaTexture, // alpha贴图是一张灰度纹理，用于控制整个表面的不透明度。（黑色：完全透明；白色：完全不透明）。 默认值为null。
        aoMap: doorAmbientOcclusionTexture, // 该纹理的红色通道用作环境遮挡贴图。默认值为null。aoMap需要第二组UV。
        displacementMap: doorHeightTexture, // 位移贴图会影响网格顶点的位置，与仅影响材质的光照和阴影的其他贴图不同，移位的顶点可以投射阴影，阻挡其他对象， 以及充当真实的几何体。位移纹理是指：网格的所有顶点被映射为图像中每个像素的值（白色是最高的），并且被重定位。
        displacementScale: 0.1, // 位移贴图对网格的影响程度（黑色是无位移，白色是最大位移）。如果没有设置位移贴图，则不会应用此值。默认值为1。
        normalMap: doorNormalTexture, // 用于创建法线贴图的纹理。RGB值会影响每个像素片段的曲面法线，并更改颜色照亮的方式。法线贴图不会改变曲面的实际形状，只会改变光照。
        metalnessMap: doorMetalnessTexture, // 该纹理的蓝色通道用于改变材质的金属度。
        roughnessMap: doorRoughnessTexture, // 该纹理的绿色通道用于改变材质的粗糙度。
    })
);
door.geometry.setAttribute(
    "uv2",
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
); // 使用aoMap必须添加此代码，添加几何体的uv2属性
door.position.y = doorSize.height / 2 - 0.1;
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
    grave.castShadow = true;
    graves.add(grave);
}

// Floor 地面
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,
    })
);
floor.geometry.setAttribute(
    "uv2",
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
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

// Ghosts 👻 诡异的光
const ghost1 = new THREE.PointLight("#ff00ff", 2, 3);
const ghost2 = new THREE.PointLight("#00ffff", 2, 3);
const ghost3 = new THREE.PointLight("#ffff00", 2, 3);
scene.add(ghost1, ghost2, ghost3);

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

// Shadows
renderer.shadowMap.enabled = true; // 开启影子
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 修改阴影类型，PCFSoftShadowMap更柔和
moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;
walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

floor.receiveShadow = true;

// optimize shadows
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;
ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;
ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;
ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update Ghosts
    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(elapsedTime * 3);

    const ghost2Angle = -elapsedTime * 0.32;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

    const ghost3Angle = -elapsedTime * 0.18;
    ghost3.position.x =
        Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
    ghost3.position.z =
        Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
    ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2);

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

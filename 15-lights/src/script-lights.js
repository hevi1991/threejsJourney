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
scene.add(new THREE.AxesHelper());

/**
 * Lights
 */
// AmbientLight 周围光，覆盖所有面的光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// DirectionalLight 方向平行光 平行光是沿着特定方向发射的光。这种光的表现像是无限远,从它发出的光线都是平行的。常常用平行光来模拟太阳光的效果
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
// 点到坐标原点的方向（默认是上往下照射, 0,1,0）
directionalLight.position.set(1, 0.25, 0);
scene.add(directionalLight);

// HemisphereLight 半球光 光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
scene.add(hemisphereLight);

// PointLight 点光源 从一个点向各个方向发射的光源。一个常见的例子是模拟一个灯泡发出的光
const pointLight = new THREE.PointLight(0xff9000, 0.5, 3); // 光源距离过远，会渲染不到
pointLight.position.set(1, -0.5, 1);
scene.add(pointLight);

// RectAreaLight 平面光源从一个矩形平面上均匀地发射光线。这种光源可以用来模拟像明亮的窗户或者条状灯光光源。
// 只支持 MeshStandardMaterial 和 MeshPhysicalMaterial 材质
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);

// SpotLight 聚光灯 光线从一个点沿一个方向射出，随着光线照射的变远，光线圆锥体的尺寸也逐渐增大。
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 6, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);
// 注意，SpotLight实例直接修改position没有效果，需要讲它的target放入scene，然后修改target的position才有效
scene.add(spotLight.target);
spotLight.target.position.x = -1.75;

/* 
Lights can cost alot when it comes to performances. 
Try to add as few lights as possible and try to use the lights that cost less.

在表演方面，灯光可能会花费很多。
尽量少加灯，尽量使用成本低的灯。

低消耗性能：
AmbientLight 周围光
HemisphereLight 半球光
中等性能：
DirectionalLight 方向平光
PointLight 点光
高消耗性能：
SpotLight 聚光灯
RectAreaLight 平面光

如果对光需求比较大，可以考虑将光源渲染到纹理图上，再直接引入
*/

// Debug Lights
const lightOpen = {
    ambientLight: true,
    directionalLight: true,
    hemisphereLight: true,
    pointLight: true,
    rectAreaLight: true,
    spotLight: true,
    toggle(light, v) {
        v ? scene.add(light) : scene.remove(light);
    },
};
gui.add(lightOpen, "ambientLight").onChange((v) =>
    lightOpen.toggle(ambientLight, v)
);
gui.add(lightOpen, "directionalLight").onChange((v) =>
    lightOpen.toggle(directionalLight, v)
);
gui.add(lightOpen, "hemisphereLight").onChange((v) =>
    lightOpen.toggle(hemisphereLight, v)
);
gui.add(lightOpen, "pointLight").onChange((v) =>
    lightOpen.toggle(pointLight, v)
);
gui.add(lightOpen, "rectAreaLight").onChange((v) =>
    lightOpen.toggle(rectAreaLight, v)
);
gui.add(lightOpen, "spotLight").onChange((v) => lightOpen.toggle(spotLight, v));

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

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
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime;
    cube.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    cube.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

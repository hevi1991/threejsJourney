import "./style.css";
import * as THREE from "three";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material); // 网格
// position是一个Vector3，三维向量对象
// mesh.position.x = 0.7; // 单位可以自行想象，例如房子，单位作为米，更容易联想
// mesh.position.y = -0.6;
// mesh.position.z = 1;
mesh.position.set(0.7, -0.6, 1); // 可使用set方法代替赋值x,y,z

scene.add(mesh);

// Scale 缩放，也是个Vector3三维向量对象
// mesh.scale.x = 2;
// mesh.scale.y = 0.5;
// mesh.scale.z = 0.5;
mesh.scale.set(2, 0.5, 0.5);

// Rotation Euler 欧拉角对象， 一圈的值是PI
mesh.rotation.reorder("YXZ"); // reorder是轴转向顺序
mesh.rotation.x = Math.PI * 0.25;
mesh.rotation.y = Math.PI * 0.25;

// Quaternion和Rotation是有关系的

// Axes help 协助轴
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

/**
 * Sizes
 */
const sizes = {
  width: 800,
  height: 600,
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// camera.position.x = 1;
// camera.position.y = 1;
camera.position.z = 3; // 改视角可以通过mesh和camera的position属性修改
scene.add(camera);

camera.lookAt(mesh.position); // 看向某个位置

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

import "./style.css";
import * as THREE from "three";

// Scene 场景
const scene = new THREE.Scene();

// Red cube 红色立方体
const geometry = new THREE.BoxGeometry(1, 1, 1); // 几何图形
const material = new THREE.MeshBasicMaterial({
  color: "red",
}); // 材质
const mesh = new THREE.Mesh(geometry, material); // 网格
scene.add(mesh);

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

// Camera 镜头
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3; // 拉远z轴视角才看得到
scene.add(camera);

// Renderer 渲染器
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

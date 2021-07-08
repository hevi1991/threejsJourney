import "./style.css";
import * as THREE from "three";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
    width: 800,
    height: 600,
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

// Time
let time = Date.now();

// Animations
const tick = () => {
    // Time 我们需要锁定每秒帧数上限
    const currentTime = Date.now();
    const deltaTime = currentTime - time; // 上一次动画耗时
    time = currentTime; // 更新给下一次时间使用

    // Update Objects
    // mesh.position.x += 0.01;
    // mesh.position.y += 0.01;
    mesh.rotation.y += 0.001 * deltaTime; // 加入了deltaTime因子，让动画在不同机器上尽量保持匀速，屏幕刷新率是60hz的话，deltaTime大概在16附近
    // Render
    renderer.render(scene, camera);
    // 当动画完成之后，会继续执行下个动画函数
    window.requestAnimationFrame(tick);
};

tick();

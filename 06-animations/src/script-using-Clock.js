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

// Clock 使用THREE提供的时间
const clock = new THREE.Clock();

// Animations
const tick = () => {
    // Clock
    const elapsedTime = clock.getElapsedTime();

    // Update Objects
    // mesh.rotation.y = elapsedTime * Math.PI * 2;
    // mesh.position.x = Math.cos(elapsedTime); // https://www.baidu.com/baidu?tn=monline_4_dg&ie=utf-8&wd=cos%28x%29
    // mesh.position.y = Math.sin(elapsedTime); // https://www.baidu.com/baidu?tn=monline_4_dg&ie=utf-8&wd=sin%28x%29
    camera.position.x = Math.cos(elapsedTime); // https://www.baidu.com/baidu?tn=monline_4_dg&ie=utf-8&wd=cos%28x%29
    camera.position.y = Math.sin(elapsedTime); // https://www.baidu.com/baidu?tn=monline_4_dg&ie=utf-8&wd=sin%28x%29
    camera.lookAt(mesh.position); // 不要用Clock的getDelta
    // Render
    renderer.render(scene, camera);
    // 当动画完成之后，会继续执行下个动画函数
    window.requestAnimationFrame(tick);
};

tick();

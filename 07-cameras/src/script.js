import * as THREE from "three";
import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Cursor 光标
 * 使用控制视角
 */
const cursor = {
    x: 0,
    y: 0,
};
window.addEventListener("mousemove", (event) => {
    // console.log(`${event.clientX}:${event.clientY}`); // 在屏幕中的x,y轴位置 左->右
    cursor.x = event.clientX / sizes.width - 0.5; // 转化成半百分比，-0.5是为了以镜头中心制造正负值
    cursor.y = -(event.clientY / sizes.height - 0.5); // y必须是负值，因为Threejs的y越大物体越上，浏览器的clientY是向下y越大
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Sizes
const sizes = {
    width: 800,
    height: 600,
};

// Scene
const scene = new THREE.Scene();

// Object
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
scene.add(mesh);

// Camera (距离，长宽比，摄像机视锥体近端面near，摄像机视锥体远端面far)
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);

// const aspectRatio = sizes.width / sizes.height;
// const camera = new THREE.OrthographicCamera(
//     -1 * aspectRatio,
//     1 * aspectRatio,
//     1,
//     -1
// );

// camera.position.x = 2;
// camera.position.y = 2;
camera.position.z = 3;
camera.lookAt(mesh.position);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
// controls.target.y = 1; // 如果要改变行为属性，需要调用update方法
// controls.update();
controls.enableDamping = true; // 让行为更平滑，要在动画调用时，更新controls

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);

// Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    // mesh.rotation.y = elapsedTime;

    // Update camera 使用官方提供的行为 看行58，更多行为可以看文档 https://threejs.org/docs/?q=controls#examples/zh/controls/OrbitControls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

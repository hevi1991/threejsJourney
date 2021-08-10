import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "stats.js";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
OPTIMIZE

- 【tip1】renderer info 查看渲染器当前对象信息
- goal: 60 frame per second 尽可能打到60fps。【!开发中时刻关注】
- multiple devices 兼容主流设备。【!开发中时刻关注】
- weight of website 轻量化项目
- less draw call 减少绘画回调。【!开发中时刻关注】
- less code in tick() 动画相关的tick函数中代码尽量少
- 【tip 6】 dispose of objects 废弃不用的对象，threejs无法判断是否是垃圾回收 https://threejs.org/docs/#manual/zh/introduction/How-to-dispose-of-objects
- lights 光源
 - avoid 尽量少用光源
 - use cheap lights (AmbientLight, DirectionLight, HemisphereLight) 用性价比高的光源
 - avoid adding or removing lights and shadows 尽量少添加和删除光源和影的操作
- use baked shadows, if needs. 用烘焙的影（影子印成的材质纹理）
- make sure the shadow map fit perfectly with the scene 影的投射位置、角度和大小调整合适
- 【tip11】use castShadow and receiveShadow wisely 投影和接影的时候醒目点，按需配置
- 【tip12】renderer 更新影子时、确定影子是否都需要更新，如果有光的动画可能要更新
- 【tip14】初始化、resize时，尽量保持setPixelRatio为2
- use the right image format. 选用对的图片格式
  - You can use .jpg or .png according to the image and the compression but also the alpha channel. 主要看是否要有透明通道
  - compression https://tinypng.com/ 压缩图片资源
- use buffer geometries 使用bufferGeometry有助于性能
- 少在代码中改顶点(vertices)
- 【tip18】尽量复用实例化的对象
- 如果多个生成的geometries不动，可以合并添加，减少drawcall
- Use cheap materials. 使用性价比高的材质
  - Some materials like MeshStandardMaterial or MeshPhysicalMaterial need more resources than materials such as MeshBasicMaterial, MeshLambertMaterial or MeshPhongMaterial.
- Use InstancedMesh 如果需要生成多个mesh，使用【tip19~22】的方案
  - If you cannot merge the geometries because you need to have control over the meshes independently, but they are using the same geometry and same material, you can use an InstancedMesh. 这种方案难度较高，但性能优良。需要计算Matrix4
- 如果使用复杂细节的模型，使用dacro的方式导入
- 服务端将glb、gltf、obj等类型文件添加到gzip压缩，减少带宽占用
- camera照射的范围才会被渲染，所以要调整好camera的far和near，减少性能消耗
- renderer devicePixelRatio不要超过2，Math.min(window.devicePixelRatio, 2)
- renderer 实例化的时候，提供 { owerPreference: "high-performance" } ，让cpu分配最好的核供使用
- 如无必要，可以不需要开启抗锯齿 antialias
- 尽量不使用后期 ShaderPass
- ShaderMaterial 尽量使用低精度 { precision: "lowp" }
- ShaderMaterial 的vertexShader和fragmentShader尽可能代码简炼，避免使用if条件判断
- 善用混合函数 mix ，去混合颜色
- 尽量用texture去替代柏林噪音
- 一些常量使用 #define CONST_NAME value 去定义使用。或在对象中提供 { defines: { CONST_NAME: 1.5 } }
- 尽量在vertexShader中计算数值，然后丟给fragmentShader，原因是fragmentShader的计算是在GPU中进行的（虽然会损失一些细节）
- 看大佬其他的优化列表 https://discoverthreejs.com/tips-and-tricks/
*/

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

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
const displacementTexture = textureLoader.load("/textures/displacementMap.png");

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
camera.position.set(2, 2, 6);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    powerPreference: "high-performance",
    antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

/**
 * Test meshes
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial()
);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(-5, 0, 0);
scene.add(cube);

const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
    new THREE.MeshStandardMaterial()
);
torusKnot.castShadow = true;
torusKnot.receiveShadow = true;
scene.add(torusKnot);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
);
sphere.position.set(5, 0, 0);
sphere.castShadow = true;
sphere.receiveShadow = true;
scene.add(sphere);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial()
);
floor.position.set(0, -2, 0);
floor.rotation.x = -Math.PI * 0.5;
floor.castShadow = true;
floor.receiveShadow = true;
scene.add(floor);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, 2.25);
scene.add(directionalLight);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    stats.begin();

    const elapsedTime = clock.getElapsedTime();

    // Update test mesh
    torusKnot.rotation.y = elapsedTime * 0.1;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);

    // monitored code goes here
    stats.end();
};

tick();

/**
 * Tips
 */

// // Tip 4
// console.log(renderer.info);

// // Tip 6
// scene.remove(cube);
// cube.geometry.dispose();
// cube.material.dispose();

// // Tip 10
// directionalLight.shadow.camera.top = 3;
// directionalLight.shadow.camera.right = 6;
// directionalLight.shadow.camera.left = -6;
// directionalLight.shadow.camera.bottom = -3;
// directionalLight.shadow.camera.far = 8;
// directionalLight.shadow.mapSize.set(1024, 1024);

// const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(cameraHelper);

// // Tip 11
cube.castShadow = true;
cube.receiveShadow = false;

torusKnot.castShadow = true;
torusKnot.receiveShadow = true;

sphere.castShadow = true;
sphere.receiveShadow = false;

floor.castShadow = false;
floor.receiveShadow = true;

// // Tip 12
// renderer.shadowMap.autoUpdate = false;
// renderer.shadowMap.needsUpdate = true;

// // Tip 18
// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
// const material = new THREE.MeshNormalMaterial();
// for (let i = 0; i < 50; i++) {
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.x = (Math.random() - 0.5) * 10;
//     mesh.position.y = (Math.random() - 0.5) * 10;
//     mesh.position.z = (Math.random() - 0.5) * 10;
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2;
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2;

//     scene.add(mesh);
// }

// // Tip 19
// const geometries = [];
// for (let i = 0; i < 50; i++) {
//     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
//     geometry.rotateX((Math.random() - 0.5) * Math.PI * 2);
//     geometry.rotateY((Math.random() - 0.5) * Math.PI * 2);

//     geometry.translate(
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10
//     );

//     geometries.push(geometry);
// }
// const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
// const material = new THREE.MeshNormalMaterial();
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// // Tip 20
// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
// const material = new THREE.MeshNormalMaterial();
// for (let i = 0; i < 50; i++) {
//     const mesh = new THREE.Mesh(geometry, material);
//     mesh.position.x = (Math.random() - 0.5) * 10;
//     mesh.position.y = (Math.random() - 0.5) * 10;
//     mesh.position.z = (Math.random() - 0.5) * 10;
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2;
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2;

//     scene.add(mesh);
// }

// // Tip 22
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.InstancedMesh(geometry, material, 50);
mesh.castShadow = true;
scene.add(mesh);

for (let i = 0; i < 50; i++) {
    const vec3 = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    );

    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(
        new THREE.Euler(
            (Math.random() - 0.5) * Math.PI * 2,
            (Math.random() - 0.5) * Math.PI * 2,
            0
        )
    );
    const matrix = new THREE.Matrix4(); // 使用矩阵4，去只生成一个实例化mesh
    matrix.makeRotationFromQuaternion(quaternion);
    matrix.setPosition(vec3);
    mesh.setMatrixAt(i, matrix);
}

// // Tip 29
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// // Tip 31, 32, 34 and 35
sphere.visible = false;
torusKnot.visible = false;
cube.visible = false;
floor.visible = false;
mesh.visible = false;

const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256);

const shaderMaterial = new THREE.ShaderMaterial({
    precision: "lowp",
    uniforms: {
        uDisplacementTexture: { value: displacementTexture },
        uDisplacementStrength: { value: 1.5 },
    },
    defines: {
        CONST_NAME: 1.5,
    },
    vertexShader: `
        uniform sampler2D uDisplacementTexture;
        uniform float uDisplacementStrength;

        // varying vec2 vUv;
        varying vec3 vColor;

        void main()
        {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            float elevation = texture2D(uDisplacementTexture, uv).r;

            // replace with using max or clamp function
            // if(elevation < 0.5)
            // {
            //     elevation = 0.5;
            // }
            elevation = clamp(elevation, 0.5, 1.0);

            modelPosition.y += elevation * uDisplacementStrength;

            gl_Position = projectionMatrix * viewMatrix * modelPosition;

            // Color
            float colorElevation = max(elevation, 0.25);
            vec3 finalColor = mix(vec3(1.0, 0.1, 0.1), vec3(0.1, 0.0, 0.5), colorElevation);

            // Varying
            // vUv = uv;
            vColor = finalColor;
        }
    `,
    fragmentShader: `
        // uniform sampler2D uDisplacementTexture;

        // varying vec2 vUv;
        varying vec3 vColor;

        void main()
        {
            // float elevation = texture2D(uDisplacementTexture, vUv).r;

            // if(elevation < 0.25)
            // {
            //     elevation = 0.25;
            // }
            // elevation = max(elevation, 0.25);

            // vec3 depthColor = vec3(1.0, 0.1, 0.1);
            // vec3 surfaceColor = vec3(0.1, 0.0, 0.5);

            // vec3 finalColor = vec3(0.0);
            // finalColor.r += depthColor.r + (surfaceColor.r - depthColor.r) * elevation;
            // finalColor.g += depthColor.g + (surfaceColor.g - depthColor.g) * elevation;
            // finalColor.b += depthColor.b + (surfaceColor.b - depthColor.b) * elevation;

            // vec3 finalColor = depthColor + (surfaceColor - depthColor) * elevation; // 直接通过vec3计算的写法
            // 善用混合函数 mix ，去混合颜色
            // vec3 finalColor = mix(depthColor, surfaceColor, elevation);

            // gl_FragColor = vec4(finalColor, 1.0);

            /// 上面的代码都转移到了vertexShader中去计算
            gl_FragColor = vec4(vColor, 1.0);
        }
    `,
});

const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial);
shaderMesh.rotation.x = -Math.PI * 0.5;
scene.add(shaderMesh);

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as dat from "dat.gui";

/// Post-processing 后期处理

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (
            child instanceof THREE.Mesh &&
            child.material instanceof THREE.MeshStandardMaterial
        ) {
            child.material.envMapIntensity = 5;
            child.material.needsUpdate = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    "/textures/environmentMaps/0/px.jpg",
    "/textures/environmentMaps/0/nx.jpg",
    "/textures/environmentMaps/0/py.jpg",
    "/textures/environmentMaps/0/ny.jpg",
    "/textures/environmentMaps/0/pz.jpg",
    "/textures/environmentMaps/0/nz.jpg",
]);
environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

/**
 * Models
 */
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
    gltf.scene.scale.set(2, 2, 2);
    gltf.scene.rotation.y = Math.PI * 0.5;
    scene.add(gltf.scene);

    updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
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

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height);
    effectComposer.setPixelRatio(renderer.getPixelRatio());
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
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Post processing
 */
// Render Target 解决outEncoding不生效的问题 /29-post-processing/node_modules/three/examples/jsm/postprocessing/EffectComposer.js
// 【antiailas 抗锯齿】 可选择 WebGLMultisampleRenderTarget 替代 WebGLRenderTarget ，以解决抗锯齿失效问题（但兼容性不好，特别是无法兼容Safari），且特别耗能
let RenderTargetClass = null;
if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
    RenderTargetClass = THREE.WebGLMultisampleRenderTarget;
    console.log("Using WebGLMultisampleRenderTarget");
} else {
    RenderTargetClass = THREE.WebGLRenderTarget;
}
const renderTarget = new RenderTargetClass(sizes.width, sizes.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    encoding: THREE.sRGBEncoding,
});
// Composer
const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(renderer.getPixelRatio());
effectComposer.setSize(sizes.width, sizes.height);

/// Pass
// renderPass
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

// dotScreenPass
const dotScreenPass = new DotScreenPass();
dotScreenPass.enabled = false;
effectComposer.addPass(dotScreenPass);

// glitchPass
const glitchPass = new GlitchPass();
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

// shaderPass
const shaderPass = new ShaderPass(RGBShiftShader);
shaderPass.enabled = false;
effectComposer.addPass(shaderPass);

// unrealBloomPass
const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.enabled = true;
unrealBloomPass.strength = 0.3;
unrealBloomPass.radius = 1.0;
unrealBloomPass.threshold = 0.6;
effectComposer.addPass(unrealBloomPass);
gui.add(unrealBloomPass, "enabled");
gui.add(unrealBloomPass, "strength", 0, 2, 0.001);
gui.add(unrealBloomPass, "radius", 0, 2, 0.001);
gui.add(unrealBloomPass, "threshold", 0, 1, 0.001);

// Tint Pass
const tintShaderObject = {
    uniforms: {
        tDiffuse: { value: null }, // 上一个后期的结果
        uTint: { value: null },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;
        varying vec2 vUv;
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb += uTint;
            gl_FragColor = color;
        }
    `,
};

const tintPass = new ShaderPass(tintShaderObject);
tintPass.uniforms.uTint.value = new THREE.Vector3();
effectComposer.addPass(tintPass);
gui.add(tintPass.material.uniforms.uTint.value, "x", -1, 1, 0.001).name("red");
gui.add(tintPass.material.uniforms.uTint.value, "y", -1, 1, 0.001).name(
    "green"
);
gui.add(tintPass.material.uniforms.uTint.value, "z", -1, 1, 0.001).name("blue");

// displacementPass 移位
const displacementShaderObject = {
    uniforms: {
        tDiffuse: { value: null }, // 上一个后期的结果
        uTime: { value: null },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
            vec2 newUv = vec2(vUv.x, vUv.y+ sin(vUv.x * 10.0 + uTime) / 10.0);
            vec4 color = texture2D(tDiffuse, newUv);
            gl_FragColor = color;
        }
    `,
};

const displacementPass = new ShaderPass(displacementShaderObject);
displacementPass.material.uniforms.uTime.value = 0; // 因为displacementShaderObject可以复用，所以这里赋值，去修改这个属性
displacementPass.enabled = false;
effectComposer.addPass(displacementPass);

// 【antiailas 抗锯齿】性能不好，表现还行
if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass();
    effectComposer.addPass(smaaPass);
    console.log("Using SMAAPass");
}

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update passes
    displacementPass.material.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update();

    // Render
    // renderer.render(scene, camera);
    effectComposer.render(elapsedTime);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

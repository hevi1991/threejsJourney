import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

/**
 * Loaders
 */
let sceneReady = false;
const loadingBarElement = document.querySelector(".loading-bar");
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        // Wait a little
        window.setTimeout(() => {
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha, {
                duration: 3,
                value: 0,
                delay: 1,
            });

            // Update loadingBarElement
            loadingBarElement.classList.add("ended");
            loadingBarElement.style.transform = "";
        }, 500);

        setTimeout(() => {
            sceneReady = true;
        }, 2000);
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
        // Calculate the progress and update the loadingBarElement
        const progressRatio = itemsLoaded / itemsTotal;
        loadingBarElement.style.transform = `scaleX(${progressRatio})`;
    }
);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

/**
 * Base
 */
// Debug
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 },
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Update all materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (
            child instanceof THREE.Mesh &&
            child.material instanceof THREE.MeshStandardMaterial
        ) {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity;
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

debugObject.envMapIntensity = 5;

/**
 * Models
 */
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
    gltf.scene.scale.set(2.5, 2.5, 2.5);
    gltf.scene.rotation.y = Math.PI * 0.5;
    scene.add(gltf.scene);

    updateAllMaterials();
});

/**
 * Points of inerest
 */
const raycaster = new THREE.Raycaster();
const points = [
    {
        position: new THREE.Vector3(1.55, 0.3, -0.6),
        element: document.querySelector(".point-0"),
    },
    {
        position: new THREE.Vector3(0.5, 0.8, -1.6),
        element: document.querySelector(".point-1"),
    },
    {
        position: new THREE.Vector3(1.6, -1.3, -0.7),
        element: document.querySelector(".point-2"),
    },
];

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
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
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const tick = () => {
    // Update controls
    controls.update();

    if (sceneReady) {
        // Go through each point
        for (const { position, element } of points) {
            // 想展示信息的点
            const screenPosition = position.clone();
            // Projects this vector from world space into the camera's normalized device coordinate (NDC) space.
            // 将此坐标从世界空间投影到相机的标准化设备坐标 (NDC) 空间。（坐标点与摄像头中心的三维空间？）
            screenPosition.project(camera);

            raycaster.setFromCamera(screenPosition, camera); // 射线从摄像头对准这个点
            const intersects = raycaster.intersectObjects(scene.children, true); // 射线穿透的mesh的点
            if (intersects.length === 0) {
                element.classList.add("visible");
            } else {
                const intersectionDistance = intersects[0].distance;
                const pointDistance = position.distanceTo(camera.position);
                if (intersectionDistance < pointDistance) {
                    // 如果穿透到mesh的距离小于摄像头到点的距离，代表点被遮挡，不该显示
                    element.classList.remove("visible");
                } else {
                    element.classList.add("visible");
                }
            }

            const translateX = screenPosition.x * sizes.width * 0.5;
            const translateY = -screenPosition.y * sizes.height * 0.5;
            element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
    }

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

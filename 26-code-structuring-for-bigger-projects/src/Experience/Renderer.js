import Experience from "./Experience";
import * as THREE from "three";

export default class Renderer {
    constructor() {
        this.experience = new Experience();
        const { sizes, canvas, camera, scene } = this.experience;
        Object.assign(this, { sizes, canvas, camera, scene });
        this.setInstance();
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.instance.physicallyCorrectLights = true;
        this.instance.outputEncoding = THREE.sRGBEncoding;
        this.instance.toneMapping = THREE.CineonToneMapping;
        this.instance.toneMappingExposure = 1.75;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.setClearColor("#211d20");
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.devicePixelRatio);
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.devicePixelRatio);
    }

    update() {
        this.instance.render(this.scene, this.camera.instance);
    }
}

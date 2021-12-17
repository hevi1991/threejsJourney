import * as THREE from "three";
import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import Resources from "./Utils/Resources";
import sources from "./sources";
import Debug from "./Utils/Debug";

let instance = null;
export default class Experience {
    constructor(canvas) {
        // Singleton
        if (instance) return instance;
        instance = this;

        // Global access (optional)
        window.experience = this;
        // Options
        this.canvas = canvas;
        // Setup
        this.debug = new Debug();
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.resources = new Resources(sources);
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.world = new World(); // TODO: 1:51:00
        // events
        this.sizes.on("resize", () => {
            this.resize();
        });
        this.time.on("tick", () => {
            this.update();
        });
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();
    }

    update() {
        this.camera.update();
        this.world.update();
        this.renderer.update();
    }

    destroy() {
        this.sizes.off("resize");
        this.time.off("tick");

        // Traverse the whole scene
        this.scene.traverse((child) => {
            // Test if it's a mesh
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();

                // Loop through the material properties
                for (const key in child.material) {
                    const value = child.material[key];

                    // Test if there is a dispose function
                    if (value && typeof value.dispose === "function") {
                        value.dispose();
                    }
                }
            }
        });

        // Dispose of the controls
        this.camera.controls.dispose();
        // Dispose of the Renderer
        this.renderer.instance.dispose();
        // Dispose Debug UI
        if (this.debug.active) this.debug.ui.destroy();
    }
}

import EventEmitter from "./EventEmitter";

export default class Time extends EventEmitter {
    constructor() {
        super();

        // Setup
        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16; // 16 fps when start

        // Wait first frame
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    tick() {
        const currentTime = Date.now();
        this.delta = currentTime - this.current;
        this.current = currentTime;
        this.elapsed = this.current - this.start;
        this.trigger("tick"); // event
        window.requestAnimationFrame(() => {
            this.tick();
        });
    }
}

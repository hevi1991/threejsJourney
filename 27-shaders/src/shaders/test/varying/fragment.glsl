precision mediump float; // 推荐用中等精度

varying float vRandom;

void main() {
    gl_FragColor = vec4(0.5, vRandom, 1.0, 1.0);

    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}

precision mediump float; // 推荐用中等精度

uniform vec3 uColor;
uniform sampler2D uTexture; // threejs的texture对应glsl类型

varying vec2 vUv; // 从vertexShader拿到的属性
varying float vElevation;

void main() {
    // gl_FragColor = vec4(uColor, 1.0);

    vec4 textureColor = texture2D(uTexture, vUv); // texture转vector4；第二个参数是uv
    textureColor.rgb *= vElevation * 2.0 + 0.7; // 添加阴影
    gl_FragColor = textureColor;

    // gl_FragColor 有时候没办法，只能通过这个属性展示来估计大概的传值情况
    // gl_FragColor = vec4(vUv, 1.0, 1.0);
}

// 以下变量都是threejs提供的
uniform mat4 projectionMatrix; // transform coordinates(坐标) into the clip space(渲染空间)
uniform mat4 viewMatrix; // relative to Camera (position, rotation, field of view, near, far)
uniform mat4 modelMatrix; // relative to Mesh (position, rotation, scale)
uniform vec2 uFrequency; // 通过RawShaderMaterial.uniforms传递过来
uniform float uTime;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv; // 传uv给fragmentShader
varying float vElevation;

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float elevation = modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

    modelPosition.z  += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
    vElevation = elevation;
}
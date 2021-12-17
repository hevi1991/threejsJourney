// 以下变量都是threejs提供的
uniform mat4 projectionMatrix; // transform coordinates(坐标) into the clip space(渲染空间)
uniform mat4 viewMatrix; // relative to Camera (position, rotation, field of view, near, far)
uniform mat4 modelMatrix; // relative to Mesh (position, rotation, scale)

attribute vec3 position;
attribute float aRandom;

varying float vRandom; // 给fragmentShader转化varying属性

void main() {

    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z += sin(modelPosition.x * 10.0) * 0.1;
    modelPosition.z += aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vRandom = aRandom; // 给fragmentShader转化varying属性
}
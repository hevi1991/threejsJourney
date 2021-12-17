uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
  /**
   * Position
   */
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Spin
  float angle = atan(modelPosition.x, modelPosition.z); // 角度
  float distanceToCenter = length(modelPosition.xz);    // 点到中心的距离
  float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
  angle += angleOffset; // 点的偏移角度
  modelPosition.x = cos(angle) * distanceToCenter;
  modelPosition.z = sin(angle) * distanceToCenter;

  // Randomness
  //   modelPosition.x += aRandomness.x;
  //   modelPosition.y += aRandomness.y;
  //   modelPosition.z += aRandomness.z;
  modelPosition.xyz += aRandomness;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  /**
   * Size
   */
  gl_PointSize = uSize * aScale;
  gl_PointSize *= (1.0 / -viewPosition.z);

  /**
   * Color
   */
  vColor = color;
}
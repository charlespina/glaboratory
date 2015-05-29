varying vec3 vNormal;
varying vec3 vP;
varying vec2 vUV;

void main() {
  vUV = uv;
  vNormal = normalMatrix * normal;
  vP = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

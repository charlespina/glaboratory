attribute vec4 tangent;
varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;

void main() {
    vUV = uv;
    vN = normalMatrix * normal;

    vec4 P4 = modelViewMatrix * vec4(position, 1.0);
    vP = P4.xyz;
    gl_Position = projectionMatrix * P4;
}

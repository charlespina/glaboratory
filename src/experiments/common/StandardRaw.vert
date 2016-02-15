precision highp float;
precision highp int;

attribute vec4 tangent;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

attribute vec2 uv;
attribute vec3 normal;
attribute vec3 position;

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

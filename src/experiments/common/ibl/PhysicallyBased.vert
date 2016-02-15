precision highp float;
precision highp int;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

attribute vec3 position;
attribute vec4 tangent;
attribute vec2 uv;
attribute vec3 normal;

varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;
varying mat3 vTBN;

void main() {
    vUV = uv;
    vN = normalMatrix * normal;

    vec3 N = normalize(normalMatrix * normal);
    vec3 T = normalize(normalMatrix * tangent.xyz);
    vec3 B = normalize(normalMatrix * cross(normal, tangent.xyz) * tangent.w);
    vTBN = mat3(
       T.x, T.y, T.z,
       B.x, B.y, B.z,
       N.x, N.y, N.z
    );

    vec4 P4 = modelViewMatrix * vec4(position, 1.0);
    vP = P4.xyz;
    gl_Position = projectionMatrix * P4;
}

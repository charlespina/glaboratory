attribute vec4 tangent;
varying vec3 vN;
varying vec2 vUV;
varying vec3 vP;
varying mat3 vTBN;

#pragma glslify: makeTBN = require(./normals/makeTBN)

void main() {
    vUV = uv;
    vN = normalMatrix * normal;
    vTBN = makeTBN(normalMatrix, normal, tangent);

    vec4 P4 = modelViewMatrix * vec4(position, 1.0);
    vP = P4.xyz;

    gl_Position = projectionMatrix * P4;
}

varying vec3 vN;
varying vec3 vP;
varying vec2 vUV;

void main() {
    vN = normalMatrix * normal;
    vP = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUV = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

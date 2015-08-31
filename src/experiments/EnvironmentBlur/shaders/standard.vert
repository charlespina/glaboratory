attribute vec4 tangent;
varying vec3 v_normal;
varying vec2 v_uv;
varying vec3 P;
varying mat4 v_model_view_matrix;

void main() {
    v_uv = uv;
    v_normal = normalMatrix * normal;
    v_model_view_matrix = modelViewMatrix;

    vec4 P4 = modelViewMatrix * vec4(position, 1.0);
    P = P4.xyz;
    gl_Position = projectionMatrix * P4;
}

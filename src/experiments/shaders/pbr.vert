attribute vec4 tangent;
varying vec3 v_normal;
varying vec2 v_uv;
varying vec3 P;
varying mat4 v_model_view_matrix;
varying mat3 TBN;

void main() {
    v_uv = uv;
    v_normal = normalMatrix * normal;
    v_model_view_matrix = modelViewMatrix;

    vec3 N = normalize(normalMatrix * normal);
    vec3 T = normalize(normalMatrix * tangent.xyz);
    vec3 B = normalize(normalMatrix * cross(normal, tangent.xyz) * tangent.w);
    TBN = mat3(
       T.x, T.y, T.z,
       B.x, B.y, B.z,
       N.x, N.y, N.z
    );

    vec4 P4 = modelViewMatrix * vec4(position, 1.0);
    P = P4.xyz;
    gl_Position = projectionMatrix * P4;
}

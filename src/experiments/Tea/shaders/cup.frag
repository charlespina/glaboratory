varying vec3 vN;
varying vec3 vP;

uniform sampler2D texture;

float spec(vec3 L, vec3 N, vec3 V) {
    float Ks = 10.0;
    float Kg = 56.0;
    vec3 H = normalize(V+L);
    float NdH = clamp(dot(N, H), 0.0, 1.0);
    return Ks * pow(NdH, Kg);
}

void main() {
    vec3 V = normalize(-vP);
    vec3 L = normalize(vec3(1.0, 1.0, 1.0)); // TODO: make uniform
    vec3 N = normalize(vN);
    // float NdL = dot(N, L);
    float specular = 1.0 * spec(L, N, V);
    specular += 0.05 * spec(normalize(vec3(1.0, 0.0, -0.5)), N, V);
    specular += 0.05 * spec(normalize(vec3(-1.0, 0.0, -0.5)), N, V);

    vec2 uv = N.xy / 2.0 + vec2(0.5);
    vec3 color = texture2D(texture, uv).rgb;

    color *= vec3(smoothstep(0.0, 0.8, specular) + 0.1);

    gl_FragColor = vec4(color, 1.0);
}

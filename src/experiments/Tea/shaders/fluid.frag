varying vec3 vN;
varying vec3 vP;
varying vec2 vUV;

uniform sampler2D texture;
uniform sampler2D reflection;

float spec(vec3 L, vec3 N, vec3 V) {
    float Ks = 0.5;
    float Kg = 5.0;
    vec3 H = normalize(V+L);
    float NdH = clamp(dot(N, H), 0.0, 1.0);
    return Ks * pow(NdH, Kg);
}

float diffuse(vec3 L, vec3 N) {
    return dot(N,L);
}

void main() {
    vec3 V = normalize(-vP);
    vec3 L = normalize(vec3(1.0, 1.0, 1.0)); // TODO: make uniform
    vec3 L2 = normalize(vec3(1.0, 0.0, -0.5)); // TODO: make uniform
    vec3 L3 = normalize(vec3(-1.0, 0.0, -0.5)); // TODO: make uniform
    vec3 N = normalize(vN);

    // float NdL = dot(N, L);
    float specular = spec(L,N,V);
    specular += 0.05 * spec(L2, N, V);
    specular += 0.05 * spec(L3, N, V);

    float luminance = diffuse(N, L);
    luminance += 0.05 * diffuse(N, L2);
    luminance += 0.05 * diffuse(N, L3);
    luminance += 0.15;

    vec2 reflUV = N.xy / 2.0 + vec2(0.5);
    vec3 color = texture2D(texture, vUV).rgb * (vec3(0.75*luminance) + 0.25*texture2D(reflection, vUV).rgb)
        + vec3(specular) * texture2D(reflection, reflUV).rgb;
    gl_FragColor = vec4(color, 1.0);
}

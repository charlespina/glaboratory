varying vec3 vP;

void main() {
    float dist = 6.0*clamp(0.5 - distance(vP.xy*vec2(1.0, 0.6), vec2(0.0, 0.0)), 0.0, 1.0);
    vec3 color = vec3(69.0/255.0, 36.0/255.0, 7.0/255.0) + vec3(0.1);
    gl_FragColor = vec4(dist*color, dist);
}

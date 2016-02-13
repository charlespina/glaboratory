vec2 getSampleUV(float step, float x, float y, vec2 uv) {
    float step_u = step * (x-1.0);
    float step_v = step * (y-1.0);
    return uv + vec2(step_u, step_v);
}

#pragma glslify: export(getSampleUV)

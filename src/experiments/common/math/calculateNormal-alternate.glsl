#pragma glslify: getSampleUV = require(./getSampleUV)

vec3 calculateNormal(int resolution, vec2 uv) {
    float step = 1.0/float(resolution);
    float dx = getValue(getSampleUV(step, 1.0, 0.0, uv))
      - getValue(getSampleUV(step, 1.0, 2.0, uv));

    float dy = getValue(getSampleUV(step, 2.0, 1.0, uv))
      - getValue(getSampleUV(step, 0.0, 1.0, uv));
    // float val = texture2D(data, uv).g;
    // float dx = dFdx(val);
    // float dy = dFdy(val);
    // vec2 deriv = normalize(vec2(dx, dy));
    return normalize(vec3(dx, dy, getValue(uv) - 0.5));
}

#pragma glslify: export(calculateNormal)

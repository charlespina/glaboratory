#pragma glslify: gradient = require('../../common/math/gradient2d.glsl', fn = fn)

vec3 calculateNormal(int resolution, vec2 uv) {
  vec2 g = gradient(resolution, uv) * 2.0 / float(resolution);
  return normalize(vec3(g, fn(uv) - 0.5));
}

#pragma glslify: export(calculateNormal)

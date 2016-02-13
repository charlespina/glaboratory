mat3 makeTBN(mat3 normalMatrix, vec3 normal, vec4 tangent) {
  vec3 N = normalize(normalMatrix * normal);
  vec3 T = normalize(normalMatrix * tangent.xyz);
  vec3 B = normalize(normalMatrix * cross(normal, tangent.xyz) * tangent.w);
  return mat3(
     T.x, T.y, T.z,
     B.x, B.y, B.z,
     N.x, N.y, N.z
  );
}

#pragma glslify: export(makeTBN)

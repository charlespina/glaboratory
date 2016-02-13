vec3 getNormal(sampler2D normal_map, mat3 TBN, vec2 uv) {
    vec3 Nm = texture2D(normal_map, uv).xyz;
    Nm *= 2.0;
    Nm -= vec3(1.0);
    return normalize(TBN * Nm);
}

#pragma glslify: export(getNormal)

#ifndef MAX_RGBD_RANGE
#define MAX_RGBD_RANGE 255.0
#endif

vec4 rgbToRgbd(vec3 rgb)
{
    float maxRGB = max(rgb.r,max(rgb.g,rgb.b));
    float D      = max(MAX_RGBD_RANGE / maxRGB, 1.0);
    D            = clamp(floor(D) / 255.0, 0.0, 1.0);
    return vec4(rgb.rgb * (D * (255.0 / MAX_RGBD_RANGE)), D);
}

#pragma glslify: export(rgbToRgbd)

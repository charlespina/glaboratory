#ifndef MAX_RGBD_RANGE
#define MAX_RGBD_RANGE 255.0
#endif

vec3 rgbdToRgb(vec4 rgbd)
{
  return rgbd.rgb * ((MAX_RGBD_RANGE / 255.0) / rgbd.a);
}

#pragma glslify: export(rgbdToRgb)

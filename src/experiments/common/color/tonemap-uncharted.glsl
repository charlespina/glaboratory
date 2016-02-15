float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 11.2;

vec3 tonemapHelper(vec3 x)
{
   return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

vec3 tonemap(vec3 rgb, float exposureBias)
{
   vec3 curr = tonemapHelper(exposureBias*rgb);
   vec3 whiteScale = 1.0/tonemapHelper(vec3(W));
   vec3 color = curr*whiteScale;
   return color;
}

vec3 tonemap(vec3 rgb)
{
  return tonemap(rgb, 2.2);
}

#pragma glslify: export(tonemap)

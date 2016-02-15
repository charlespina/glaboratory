import vdc from 'vdc';
import THREE from 'three';
import Compute from '../compute/Compute';
import RenderUtil from '../compute/RenderUtil';
import StandardRawVert from '../StandardRaw.vert';
import EnvironmentBlurFrag from './EnvironmentBlur.frag';
import BRDFIntegratorFrag from './BRDFIntegrator.frag';
import loadHdrTexture from '../hdr/loadHdrTexture';

class ImageBasedLightGenerator {
  constructor(renderSystem, sourceTexture) {
    this.resolution = 1024;
    this.numLevels = 10; // corresponds to 2^8 = 256
    this.brdfResolution = 256; // lower resolution is fine for brdf
    this.vdcResolution = 1024; // corresponds to number of samples in brdf integrator
    this.renderSystem = renderSystem;

    const vdcMap = this.createVdcMap(this.vdcResolution);

    this.brdf = (new Compute(this.renderSystem,
      StandardRawVert,
      BRDFIntegratorFrag,
      {
        resolution: this.brdfResolution,
        uniforms: {
          'vdc_map': { type: 't', value: vdcMap },
        },
      }
    )).run();

    this.promise = new Promise((resolve, reject) => {
      const hasTextureLOD = this.renderSystem.renderer.context.getExtension('EXT_shader_texture_lod');
      if (!hasTextureLOD) {
        reject('Texture LOD extension is unavailable.');
      }

      this.uniforms = {
        'vdc_map': { type: 't', value: vdcMap },
        'roughness_constant': { type: 'f', value: 0.0 },
        'reflection_map': {
          type: 't',
          value: null,
        },
      };

      return loadHdrTexture(sourceTexture)
      .then((tex) => {
        try {
          resolve({ ibl: this.generate(tex), brdf: this.brdf });
        } catch (e) {
          reject(e);
        }
      });
    });

    this.compute = new Compute(this.renderSystem,
      StandardRawVert,
      EnvironmentBlurFrag,
      {
        resolution: this.resolution,
        uniforms: this.uniforms,
      }
    );
  }

  generate(tex) {
    this.uniforms.reflection_map.value = tex;
    this.uniforms.reflection_map.value.needsUpdate = true;

    const baseTexture = this.compute.run();
    const baseImage = RenderUtil.createImage(this.renderSystem, baseTexture, this.resolution, this.resolution);
    const result = new THREE.CanvasTexture(baseImage);
    result.wrapS = THREE.RepeatWrapping;
    result.wrapT = THREE.RepeatWrapping;
    result.minFilter = THREE.LinearMipMapLinearFilter;
    result.magFilter = THREE.NearestFilter;
    result.format = THREE.RGBAFormat;
    result.generateMipmaps = false;
    result.mipmaps[0] = baseImage;

    for (let i = 1; i <= this.numLevels; i++) {
      const res = this.resolution >> i;
      const mipLevel = RenderUtil.createRenderTarget(res, res);
      this.uniforms.roughness_constant.value = i / (this.numLevels - 1);
      this.uniforms.roughness_constant.needsUpdate = true;
      this.compute.renderToTexture(mipLevel);
      const image = RenderUtil.createImage(this.renderSystem, mipLevel, res, res);
      result.mipmaps[i] = image;
    }

    result.needsUpdate = true;
    return result;
  }

  /*
   * Van der Corput sequence is a pseudo-random sequence, useful for sampling
   * random positions on a hemisphere, as we do
  **/
  createVdcMap(resolution) {
    const vdcData = new Float32Array(resolution);

    const generator = vdc({ n: 0, b: 2 });
    for (let i = 0; i < resolution; i++) {
      vdcData[i] = generator.next();
    }

    const vdcMap = new THREE.DataTexture(vdcData,
      resolution,
      1,
      THREE.LuminanceFormat,
      THREE.FloatType);

    // Data textures need to have needsUpdate set after being created
    // for some reason
    vdcMap.needsUpdate = true;

    return vdcMap;
  }
}

function generateImageBasedLight(renderSystem, sourceTexture) {
  const iblgen = new ImageBasedLightGenerator(renderSystem, sourceTexture);
  return iblgen.promise;
}

export {
  ImageBasedLightGenerator as default,
  generateImageBasedLight
};

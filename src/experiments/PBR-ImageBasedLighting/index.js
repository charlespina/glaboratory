import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
import ShaderParameter from '../../core/ShaderParameter';
import THREE from 'three';
import iblMapUrl from '../HDR/textures/Newport_Loft_Ref.hdr';
import { generateImageBasedLight } from '../common/ibl/ImageBasedLightGenerator';
import PBRFrag from '../common/ibl/PhysicallyBased.frag';
import PBRVert from '../common/StandardRawTBN.vert';
import BGFrag from '../common/Texture.frag';
import BGVert from '../common/StandardRaw.vert';

class PBRIBL extends Experiment {
  constructor() {
    super("PBR with IBL");
    this.thumbnail = "images/test.png";
    this.description = "Physically based rendering, with an image based light.";
    this.uniforms = {
      base_color_constant: {
        type: 'c',
        value: new THREE.Color(0x006AA4),
      },
      roughness_constant: {
        type: 'f',
        value: 0.25,
      },
      metalicity: {
        type: 'f',
        value: 0.0,
      },
      specular_level: {
        type: 'f',
        value: 0.04,
        min: 0.02,
        max: 0.08,
      },
      light_color: {
        type: 'c',
        value: new THREE.Color(0xFFFFFF),
      },
      light_direction: {
        type: 'c',
        value: new THREE.Color(0xCCCCCC),
      },
      light_intensity: {
        type: 'f',
        value: 1.0,
      },
      use_textures: {
        type: 'i',
        value: 0,
        min: 0,
        max: 1,
        hidden: true,
      },
      brdf_map: {
        type: 't',
        value: null,
      },
      ibl_map: {
        type: 't',
        value: null,
      },
      ibl_exposure: {
        type: 'f',
        value: 2.2,
        min: 0.0,
        max: 3.0,
        hidden: true,
      },
    };
  }

  setup(context) {
    this.context = context;
    generateImageBasedLight(context, iblMapUrl).then(({ ibl, brdf })=> {
      this.uniforms.ibl_map.value = ibl;
      this.uniforms.ibl_map.needsUpdate = true;

      this.uniforms.brdf_map.value = brdf;
      this.uniforms.brdf_map.needsUpdate = true;

      this.bgUniforms.texture_map.value = ibl;
      this.bgUniforms.texture_map.needsUpdate = true;
    });


    var geo = new THREE.SphereGeometry(100, 64, 64);
    var material = new THREE.RawShaderMaterial({
      vertexShader: PBRVert,
      fragmentShader: PBRFrag,
      uniforms: this.uniforms,
    });
    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);
    //controls.addEventListener('change', ()=>context.render());


    // background
    this.orthoCam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
    this.orthoCam.position.z = 2
    this.bgUniforms = {
      texture_map: {
        type: 't',
        value: null,
      },
      texture_exposure: {
        type: 'f',
        value: this.uniforms.ibl_exposure.value,
        min: 0.01,
        max: 10.0,
        hidden: true,
      },
      texture_lod: {
        type: 'f',
        value: 1.0,
        min: 0.0,
        max: 9.0
      },
      texture_offset: {
        type: 'f',
        value: 0.0,
        min: -1.0,
        max: 1.0,
      },
      texture_scale: {
        type: 'f',
        value: 1.7,
        min: 0.01,
        max: 10.0,
      }
    };
    this.bgMaterial = new THREE.RawShaderMaterial({
      fragmentShader: BGFrag,
      vertexShader: BGVert,
      uniforms: this.bgUniforms,
      depthWrite: false,
    });
    this.bg = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 1, 1),
      this.bgMaterial);
    this.bgScene = new THREE.Scene();
    this.bgScene.add(this.bg);

    const exposureParameter = new Parameter('Exposure', {
      type: 'f',
      value: this.uniforms.ibl_exposure.value,
      min: 0.0,
      max: 8.0,
    });
    exposureParameter.onChange = this.onExposureChange.bind(this);
    this.addParameter(exposureParameter);
    this.addParameters(ShaderParameter.fromUniformHash(this.uniforms));
    this.addParameters(ShaderParameter.fromUniformHash(this.bgUniforms));
  }

  onExposureChange(val) {
    this.uniforms.ibl_exposure.value = val;
    this.uniforms.ibl_exposure.needsUpdate = true;
    this.bgUniforms.texture_exposure.value = val;
    this.bgUniforms.texture_exposure.needsUpdate = true;
  }

  update(dt) {
  }

  render() {
    this.context.renderer.autoClear = false;
    this.context.renderer.render(this.bgScene, this.orthoCam);
    this.context.renderDefaultCamera();
  }
}


module.exports = new PBRIBL();

import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
import ShaderParameter from '../../core/ShaderParameter';
import envMap from './textures/Newport_Loft_Ref.hdr';
import fragShader from './shaders/HDR.frag';
import bgFragShader from '../common/Texture.frag';
import bgVertShader from '../common/StandardRawTBN.vert';
import vertShader from '../common/StandardTBN.vert';
import loadHdrTexture from '../common/hdr/loadHdrTexture';
import { EventEmitter } from 'events';
import THREE from 'three';
import thumbnail from './thumbnail.png';

// glsl-rgbe2rgb
// glsl-envmap-cube
// glsl-envmap-equirect
// glsl-tonemap-filmic

class HDR extends Experiment {
  constructor() {
    super("HDR");
    this.thumbnail = thumbnail;
    this.description = "High dynamic range environment mapping";
    this.uniforms = {
      envMap: {
        type: 't',
        value: null,
      },
      exposure: {
        type: 'f',
        value: 1.0,
        min: 0.3,
        max: 3.0,
      },
    };

    this.bgUniforms = {
      texture_exposure: {
        type: 'f',
        value: 1.0,
        min: 0.01,
        max: 10.0,
      },
      texture_scale: {
        type: 'f',
        value: 1.0,
        hidden: true,
      },
      texture_map: {
        type: 't',
        value: null,
      },
      texture_lod: {
        type: 'f',
        value: 0.0,
        hidden: true,
      },
    };
    this.addParameters(ShaderParameter.fromUniformHash(this.uniforms));
    this.addParameters(ShaderParameter.fromUniformHash(this.bgUniforms));

    loadHdrTexture(envMap).then((tex)=> {
      tex.needsUpdate = true;

      this.uniforms.envMap.value = tex;
      this.uniforms.envMap.needsUpdate = true;

      this.bgUniforms.texture_map.value = tex;
      this.bgUniforms.texture_map.needsUpdate = true;
    });
  }

  createBackground() {
    const bgMaterial = new THREE.RawShaderMaterial({
      fragmentShader: bgFragShader,
      vertexShader: bgVertShader,
      uniforms: this.bgUniforms,
      depthWrite: false,
    });
    const bg = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 1, 1),
      bgMaterial);
    this.bgScene = new THREE.Scene();
    this.bgScene.add(bg);
    this.orthoCam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, -10);
  }

  setup(context) {
    this.context = context;
    const floatTexturesSupported = context.renderer.context.getExtension('OES_texture_float')
    if (!floatTexturesSupported) throw "Float textures are not supported.";

    const textureLodSupported = context.renderer.context.getExtension('EXT_shader_texture_lod');
    if (!textureLodSupported) throw "Texture LOD lookups are not supported.";

    this.createBackground();

    var geo = new THREE.SphereGeometry(100, 64, 64);
    var material = new THREE.ShaderMaterial({
      fragmentShader: fragShader,
      vertexShader: vertShader,
      uniforms: this.uniforms,
    });
    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);
  }

  update(dt) {
  }

  render() {
    this.context.renderer.autoClear = false;
    this.context.renderer.render(this.bgScene, this.orthoCam);
    this.context.renderDefaultCamera();
  }
}


module.exports = new HDR();

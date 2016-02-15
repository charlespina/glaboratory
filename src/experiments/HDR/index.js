import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
import ShaderParameter from '../../core/ShaderParameter';
import envMap from './textures/Newport_Loft_Ref.hdr';
import fragShader from './shaders/HDR.frag';
import vertShader from '../common/StandardTBN.vert';
import loadHdrTexture from '../common/hdr/loadHdrTexture';
import { EventEmitter } from 'events';
import THREE from 'three';

// glsl-rgbe2rgb
// glsl-envmap-cube
// glsl-envmap-equirect
// glsl-tonemap-filmic

class HDR extends Experiment {
  constructor() {
    super("HDR");
    this.thumbnail = "images/test.png";
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

    this.addParameters(ShaderParameter.fromUniformHash(this.uniforms));

    loadHdrTexture(envMap).then((tex)=> {
      this.uniforms.envMap.value = tex;
      this.uniforms.envMap.value.needsUpdate = true;
    });
  }

  setup(context) {
    const floatTexturesSupported = context.renderer.context.getExtension('OES_texture_float')
    if (!floatTexturesSupported) throw "Float textures are not supported.";

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
}


module.exports = new HDR();

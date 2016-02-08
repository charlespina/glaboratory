import Experiment from '../../core/Experiment';
import ShaderParameter from '../../core/ShaderParameter';
import Parameter from '../../core/Parameter';
import THREE from 'three';
import vertShader from './shaders/standard.vert';
import fragShader from './shaders/reflection_blur.frag';
import vdc from 'vdc';

var DIM = 32;
var N = DIM*DIM; // 1024

var createVanDerCorputSequenceData = function(N) {
  var vdcData = new Float32Array(N);

  var generator = vdc({n:0, b:2});
  for(var i=0; i<N; i++) {
    vdcData[i] = generator.next();
  }

  return vdcData;
};

var uniforms = {
  "vdc_map":{
    type: 't',
    value: null,
  },
  "reflection_map": {
    type: 't',
    value: null,
  },
  "roughness_constant": {
    type: 'f',
    value: 0.5,
    min: 0.0,
    max: 1.0
  },
};

class EnvironmentBlur extends Experiment {
  constructor() {
    super("Environment Blur");
    this.thumbnail = "images/env-blur.png";
    this.description = "Convolution of a scene based on roughness, for use with PBR systems."
    this.addParameters(ShaderParameter.fromUniformHash(uniforms));
    this.parameters.forEach((param)=> {
      param.onChange = (v)=> this.onParameterChange(v);
    });
  }

  onParameterChange(value) {
    this.dirty = true;
  }

  setup(context) {
    uniforms.vdc_map.value = new THREE.DataTexture(createVanDerCorputSequenceData(N), N, 1, THREE.LuminanceFormat, THREE.FloatType);
    uniforms.vdc_map.value.needsUpdate = true;
    uniforms.reflection_map.value = THREE.ImageUtils.loadTexture("textures/reflection.png", THREE.UVMapping, ()=> {
      this.dirty = true;
    });
    // THREE.ImageUtils.loadTexture("textures/reflection2.gif");

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader
    });

    var geo = new THREE.SphereGeometry(100, 64, 46);

    context.camera.position.z = 200;

    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);

    this.dirty = true;
  };

  resize(context) {
    this.dirty = true;
  }

  update(dt) {
  }

  render(context) {
    if (this.dirty) {
      context.renderDefaultCamera();
      this.dirty = false;
    }
  }
}

module.exports = new EnvironmentBlur();

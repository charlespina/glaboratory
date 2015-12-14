import Experiment from '../../core/Experiment';
import ShaderParameter from '../../core/ShaderParameter';
import Parameter from '../../core/Parameter';
var THREE = require('../../lib/three');
var vertShader = require('./shaders/standard.vert');
var fragShader = require('./shaders/reflection_blur.frag');
var vdc = require('vdc');

var DIM = 32;
var N = DIM*DIM; // 1024

console.log(THREE.ShaderPass);

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

var exp = new Experiment("Environment Blur");

exp.onParameterChange = function(value) {
  this.dirty = true;
}

exp.addParameters(ShaderParameter.fromUniformHash(uniforms));
exp.parameters.forEach(function(param) {
  console.log("testing");
  param.onChange = this.onParameterChange.bind(this);
}.bind(exp));

exp.setup = function(context) {
  uniforms.vdc_map.value = new THREE.DataTexture(createVanDerCorputSequenceData(N), N, 1, THREE.LuminanceFormat, THREE.FloatType);
  uniforms.vdc_map.value.needsUpdate = true;
  uniforms.reflection_map.value = THREE.ImageUtils.loadTexture("textures/reflection.png");
  // THREE.ImageUtils.loadTexture("textures/reflection2.gif");

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader
  });

  var geo = new THREE.SphereGeometry(100, 64, 46);
  geo.computeTangents();

  context.camera.position.z = 200;

  this.mesh = new THREE.Mesh(geo, material);
  context.scene.add(this.mesh);

  this.dirty = true;
};

exp.update = function(dt) {
};

exp.render = function(context) {
  if (this.dirty) {
    context.renderDefaultCamera();
    this.dirty = false;
  }
};

module.exports = exp;

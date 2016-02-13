import Experiment from '../../core/Experiment';
import ShaderParameter from '../../core/ShaderParameter';
import Parameter from '../../core/Parameter';
import OBJLoader from '../../lib/OBJLoader';
import THREE from 'three';
import vertShader from '../common/StandardTBN.vert';
import fragShader from './shaders/PBR.frag';

var uniforms = {
  "t": {
    type: 'f',
    value: 0.0,
    hidden: true,
  },
  "normal_map": {
    type: 't',
    value: null,
  },
  "use_textures": {
    type: 'i',
    value: 0,
    min: 0,
    max: 1,
    step: 1,
  },
  "roughness_constant": {
    type: 'f',
    value: 0.5,
    min: 0.0,
    max: 1.0
  },
  "roughness_boost": {
    type: 'f',
    hidden: true,
    value: 0,
    min: 0,
    max: 1
  },
  "roughness_gain": {
    type: 'f',
    value: 1,
    hidden: true,
    min: 0,
    max: 2
  },
  "roughness_map": {
    type: 't',
    value: null,
  },
  "metalicity": {
    type: 'f',
    min: 0,
    max: 1,
    value: 0
  },
  "specular_level": {
    type: 'f',
    min: 0,
    max: 0.08,
    value: 0.04
  },
  "base_color_map": {
    type: 't',
    value: null,
  },
  "base_color_constant": {
    type: 'c',
    value: (new THREE.Color(0x49389B))
  },
  "light_intensity": {
    type: 'f',
    min: 0,
    max: 10,
    value: 1
  },
  "light_color": {
    type: 'c',
    value: new THREE.Color(0xFFFFFF) //(new THREE.Color(0x0064aa))
  },
  "light_direction": {
    type: 'c',
    hidden: true,
    value: (new THREE.Color(0xFFFFFF))
  },
};

class PBR extends Experiment {
  constructor() {
    super("Physically Based Rendering");
    this.thumbnail = "images/pbr.png";
    this.description = "Physically based rendering implementation.";
    this.addParameters(ShaderParameter.fromUniformHash(uniforms));
  }

  setup(context) {
    uniforms.normal_map.value = THREE.ImageUtils.loadTexture("textures/fuse_char_Normal.png")
    uniforms.base_color_map.value = THREE.ImageUtils.loadTexture("textures/fuse_char_BaseColor.png")
    uniforms.roughness_map.value = THREE.ImageUtils.loadTexture("textures/fuse_char_Roughness.png")

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader
    });

    var geo = new THREE.SphereGeometry(100, 64, 46);

    context.camera.position.z = 200;

    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);
  }

  update(dt) {
    this.mesh.rotation.y += 0.010;
  }
}

module.exports = new PBR();

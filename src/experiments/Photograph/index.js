import Experiment from '../../core/Experiment';
import Parameter from '../../core/Parameter';
import PhotoFrag from './shaders/Photo.frag';
import PhotoVert from '../common/StandardTBN.vert';
import imageURL from './textures/red-fox-300x400.jpg';
import thumbnailURL from './textures/thumbnail.png';
import ShaderParameter from '../../core/ShaderParameter';
import * as THREE from 'three';

const photoUniforms = {
  "grain_size": {
    type: 'f',
    value: 130.0,
    min: 0.0,
    max: 400.0,
  },
  "grain_height": {
    type: 'f',
    value: 0.02,
    min: 0.0,
    max: 0.1,
  },
  "normal_map": {
    type: 't',
    value: null,
  },
  "roughness_constant": {
    type: 'f',
    value: 0.38,
    min: 0.0,
    max: 1.0
  },
  "metalicity": {
    type: 'f',
    min: 0,
    max: 1,
    value: 0,
    hidden: true,
  },
  "specular_level": {
    type: 'f',
    min: 0,
    max: 0.08,
    value: 0.04,
    hidden: true,
  },
  "base_color_map": {
    type: 't',
    value: null,
  },
  "tint": {
    type: 'c',
    value: (new THREE.Color(0xFFFFFF))
  },
  "light_intensity": {
    type: 'f',
    min: 0,
    max: 10,
    value: 1.6
  },
  "light_color": {
    type: 'c',
    value: new THREE.Color(0xFFEEBA) //(new THREE.Color(0x0064aa))
  },
  "light_direction": {
    type: 'c',
    // value: (new THREE.Color(0xCAA3FD))
    value: new THREE.Color("rgb(100, 138, 198)")
  },
};

class Photograph extends Experiment {
  constructor() {
    super("Photo Look");
    this.thumbnail = thumbnailURL;
    this.description = "An image shaded like a photograph.";
    this.addParameters(ShaderParameter.fromUniformHash(photoUniforms));
  }

  setup(context) {
    photoUniforms.base_color_map.value = THREE.ImageUtils.loadTexture(imageURL);
    var geo = new THREE.PlaneGeometry(300, 400);
    var material = new THREE.ShaderMaterial({
      fragmentShader: PhotoFrag,
      vertexShader: PhotoVert,
      uniforms: photoUniforms
    });
    geo.computeVertexNormals();
    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);
    this.t = 0.0;
  }

  update(dt) {
    this.t += 0.015;
    this.mesh.rotation.y = Math.sin(this.t) / 4.0;
  }
}


export default new Photograph();

import Experiment from '../../core/Experiment';
import GridFrag from './shaders/Grid.frag';
import GridVert from '../common/StandardTBN.vert';
import Parameter from '../../core/Parameter';
import ShaderParameter from '../../core/ShaderParameter';
import THREE from 'three';

class Grid extends Experiment {
  constructor() {
    super("Grid");
    this.thumbnail = "images/test.png";
    this.description = "A grid";
    this.uniforms = {
      resolution: {
        type: 'f',
        value: 1.0,
      },
    };
  }

  setup(context) {
    var geo = new THREE.PlaneGeometry(300, 400);
    var material = new THREE.ShaderMaterial({
      fragmentShader: GridFrag,
      vertexShader: GridVert,
      uniforms: this.uniforms,
    });
    geo.computeVertexNormals();
    this.mesh = new THREE.Mesh(geo, material);
    context.scene.add(this.mesh);
    this.t = 0.0;
    this.context = context;
  }

  update(dt) {
    this.t += 0.015;
    this.uniforms.resolution.value = this.context.width;
    this.mesh.rotation.x = -Math.PI/3.0 + Math.sin(this.t) / 2.0;
  }
}


module.exports = new Grid();

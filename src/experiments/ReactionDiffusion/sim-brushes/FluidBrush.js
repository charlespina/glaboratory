import SimBrush from '../../common/painting/SimBrush';
import TextureUtils from '../../common/TextureUtils';
import ShaderParameter from '../../../core/ShaderParameter';
import Parameter from '../../../core/Parameter';

import THREE from 'three';

const ComputeFrag = require('../shaders/Fluid.frag');
const SharedVert = require('../../common/painting/shaders/Shared.vert')

class FluidBrush extends SimBrush {
  constructor() {
    super();
    this.name = 'Fluid Brush';
  }

  get uniforms() : object {
    return this._uniforms;
  }

  get vertexShader() : string {
    return SharedVert;
  }

  get fragmentShader() : string {
    return ComputeFrag;
  }

  initUniforms() {
    this._uniforms = {
      "time": {
        type: 'f',
        value: 0.0,
        hidden: true
      },
      "delta_time": {
        type: 'f',
        value: 0.0,
        hidden: true
      },
      "resolution": {
        type: 'i',
        value: this.resolution,
        hidden: true
      },
      "brush_softness": {
        type: 'f',
        value: 0.0,
        min: 0.0,
        max: 1.0
      },
      "brush_width": {
        type: 'f',
        value: 10.0,
        min: 1.0,
        max: this.resolution/5.0
      },
      "brush_position": {
        type: 'v2',
        value: new THREE.Vector2(),
        hidden: true
      },
      "brush_active": {
        type: 'i',
        value: false,
        hidden: true
      },
      "A_diffuse": {
        type: 'f',
        min: 0.0,
        max: 1.0,
        value: 1.0
      },
      "B_diffuse": {
        type: 'f',
        min: 0.0,
        max: 1.0,
        value: 0.5
      },
      "A_feed_rate": {
        type: 'f',
        min: 0.0,
        max: 0.1,
        value: 0.0545
      },
      "B_kill_rate": {
        type: 'f',
        min: 0.0,
        max: 0.1,
        value: 0.062
      },
      "symmetry_mode": {
        type: 'i',
        value: DEFAULT_SYMMETRY_MODE.value,
        hidden: true
      },
      "data_texture": {
        type: 't',
        value: null
      }
    };
  }

  init(context, resolution) {
    super.init(context, resolution);

    // assign data texture to appropriate uniform
    this.setUniform(this._uniforms.data_texture, this.buffer[1]);
    this.initParams();
  }

  initParams() {
    this.parameters.push(
      new Parameter("Axis of Symmetry", {
        value: DEFAULT_SYMMETRY_MODE,
        type: 'choice',
        choices: [
          SYMMETRY_MODES.NONE,
          SYMMETRY_MODES.HORIZONTAL,
          SYMMETRY_MODES.VERTICAL,
          SYMMETRY_MODES.RADIAL_SYMMETRY
        ],
        onChange: (newValue) => {
          this.setUniform(this._uniforms.symmetry_mode, newValue.value);
        }
      })
    );

    this.parameters = this.parameters.concat( ShaderParameter.fromUniformHash(this._uniforms) );
    this.speed = new Parameter("Speed", {type:'i', value:5, min:1, max:20});
    this.parameters.push(this.speed);
  }

  update(dt) {
    for(let i=0; i<this.speed.value; i++) {
      this.setUniform(this._uniforms.time, this._uniforms.time.value + 0.01);
      // KS says dt = 1.0 works well. may want to scale up actual dt
      this.setUniform(this._uniforms.delta_time, 1.0);
      this.context.renderer.render(this.scene, this.camera, this.output, true);

      TextureUtils.swapBuffers(this.buffer);
      this.output = this.buffer[0];
      this.setUniform(this._uniforms.data_texture, this.buffer[1]);
    }
  }

  draw(pos) {
    this.setUniform(this._uniforms.brush_position, pos);
  }

  set isDrawing(val) {
    super.isDrawing = val;
    this.setUniform(this._uniforms.brush_active, val);
  }
}

export default FluidBrush;

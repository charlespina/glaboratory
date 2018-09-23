import SimBrush from './SimBrush';
import ShaderParameter from '../../../core/ShaderParameter';
import Parameter from '../../../core/Parameter';

import * as THREE from 'three';

const BrushFrag = require('./shaders/BrushTip.frag');
const SharedVert = require('./shaders/Shared.vert')

const SYMMETRY_MODES = {
  NONE: {name:'No Symmetry', value:0},
  HORIZONTAL: {name:'Horizontal Symmetry', value:1},
  VERTICAL: {name:'Vertical Symmetry', value:2},
  RADIAL_SYMMETRY: {name:'Radial Symmetry', value: 3},
};

const DEFAULT_SYMMETRY_MODE=SYMMETRY_MODES.RADIAL_SYMMETRY;

export default class BrushTip extends SimBrush {
  constructor(context, resolution) {
    super(context, resolution, 1, false);
    this.parameters = [];
    this.initParams();
  }

  get vertexShader() {
    return SharedVert;
  }

  get fragmentShader() {
    return BrushFrag;
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

    this.parameters = this.parameters.concat(ShaderParameter.fromUniformHash(this._uniforms));
  }

  get uniforms() {
    return this._uniforms;
  }

  initUniforms() {
    this._uniforms = {
      "pulse_magnitude": {
        type: 'f',
        value: 0.5,
        min: 0,
        max: 1.0
      },
      "pulse_frequency": {
        type: 'f',
        value: 5.0,
        min: 0.0,
        max: 20.0,
      },
      "pulse_active": {
        type: 'i',
        value: 1,
        min: 0,
        max: 1,
        step: 1,
        hidden: true, // TODO: boolean parameters
      },
      "symmetry_mode": {
        type: 'i',
        value: DEFAULT_SYMMETRY_MODE.value,
        hidden: true
      },
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
    };
  }

  update(dt) {
    this.setUniform(this._uniforms.time, this._uniforms.time.value + dt);
    this.setUniform(this._uniforms.delta_time, dt);
    this.context.renderer.render(this.scene, this.camera, this.output, true);
  }

  draw(pos) {
    if (this.lastPosition === undefined) {
      this.velocity = new THREE.Vector2(0.0, 0.0);
    } else {
      this.velocity.subVectors(pos, this.lastPosition);
      // TODO: use velocity to affect brush size
    }
    this.setUniform(this._uniforms.brush_position, pos);
    // this.setUniform(this._uniforms.brush_velocity, this.velocity);
    this.lastPosition = pos;
  }

}

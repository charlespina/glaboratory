import SimBrush from './SimBrush';
import TextureUtils from '../TextureUtils';
import ShaderParameter from '../../../core/ShaderParameter';
import Parameter from '../../../core/Parameter';

var THREE = require('../../../lib/three');

const ComputeFrag = require('../shaders/ReactionDiffusion.frag');
const SharedVert = require('../shaders/Shared.vert')

export default class ReactionDiffusionBrush extends SimBrush {
  constructor(context, resolution) {
    super(context, resolution, 2, false);
    this.name = 'Reaction Diffusion Brush';

    // assign data texture to appropriate uniform
    this.setUniform(this._uniforms.data_texture, this.buffer[1]);
    this.initParams();
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

  connectBrushTip(brushTip) {
    this.setUniform(this._uniforms.brush_texture, brushTip.output);
  }

  initUniforms() {
    this._uniforms = {
      "brush_active": {
        type: 'i',
        value: 0,
        hidden: true,
      },
      "brush_texture": {
        type: 't',
        value: null
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

      "data_texture": {
        type: 't',
        value: null
      }
    };
  }

  initParams() {
    this.parameters = [];
    this.parameters = this.parameters.concat( ShaderParameter.fromUniformHash(this._uniforms) );
    this.speed = new Parameter("Speed", {type:'i', value:5, min:1, max:20});
    this.parameters.push(this.speed);
  }

  update(dt) {
    // draw brush position

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
    // nothing
  }

  set isDrawing(val) {
    super.isDrawing = val;
    this.setUniform(this._uniforms.brush_active, val);
  }
}

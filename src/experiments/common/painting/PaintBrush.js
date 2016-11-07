import SimBrush from './SimBrush';
import TextureUtils from '../TextureUtils';
import ShaderParameter from '../../../core/ShaderParameter';
import Parameter from '../../../core/Parameter';

import THREE from 'three';

const PaintBrushFrag = require('./shaders/PaintBrush.frag');
const SharedVert = require('./shaders/Shared.vert');

export default class PaintBrush extends SimBrush {
  constructor(context, resolution) {
    super(context, resolution, 2, false);
    this.name = 'Paint Brush';

    this.initParams();
    this.setUniform(this._uniforms.canvas_texture, this.buffer[1]);
  }

  get uniforms() : object {
    return this._uniforms;
  }

  get vertexShader() : string {
    return SharedVert;
  }

  get fragmentShader() : string {
    return PaintBrushFrag;
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
      "canvas_texture": {
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
    };
  }

  initParams() {
    this.parameters = [];
    this.parameters = this.parameters.concat( ShaderParameter.fromUniformHash(this._uniforms) );
  }

  update(dt) {
    // draw brush position
    this.setUniform(this._uniforms.time, this._uniforms.time.value + dt);
    this.setUniform(this._uniforms.delta_time, dt);
    this.context.renderer.render(this.scene, this.camera, this.output, true);

    TextureUtils.swapBuffers(this.buffer);
    this.output = this.buffer[0];
    this.setUniform(this._uniforms.canvas_texture, this.buffer[1]);
  }

  draw(pos) {
    // nothing
  }

  set isDrawing(val) {
    super.isDrawing = val;
    this.setUniform(this._uniforms.brush_active, val);
  }
}

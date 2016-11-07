import Painter from "./Painter";
import paintHeightFrag from "./shaders/PaintHeight.frag";
import BrushMode from "./BrushMode";


export default class HeightPainter extends Painter {

  constructor(brushTip, renderSystem, resolution, options) {
    options.fragShader = paintHeightFrag;
    super(brushTip, renderSystem, resolution, options);

    console.log('height', options.brushHeight);
    console.log('mode', options.brushMode);
    this.uniforms.brush_height = {
      type: 'f',
      value: options.brushHeight
    };

    this.uniforms.brush_mode = {
      type: 'i',
      value: options.brushMode
    };
  }

  setBrushHeight(height) {
    this.uniforms.brush_height.value = height;
    this.uniforms.brush_height.needsUpdate = true;
  }

  setBrushMode(mode) {
    this.uniforms.brush_mode.value = mode;
    this.uniforms.brush_mode.needsUpdate = true;
  }
}

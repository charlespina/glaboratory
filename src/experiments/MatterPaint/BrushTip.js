import standardVert from "../common/StandardRaw.vert";
import brushTipFrag from "./shaders/BrushTip.frag";
import Compute from "../common/compute/Compute";
import * as THREE from "three";

export default class BrushTip {
  constructor(renderSystem, resolution) {
    this.renderSystem = renderSystem;
    this.resolution = resolution;

    this.useLineSegments = true;

    this.uniforms = {
      resolution: { type: 'i', value: this.resolution },

      /* controls whether drawing is enabled */
      brush_active: { type: 'i', value: 0 },

      /* controls whether the brush points are connected by a line segment */
      brush_connected: { type: 'i', value: this.useLineSegments ? 1 : 0 },

      brush_position: { type: 'v2', value: new THREE.Vector2(0, 0) },
      brush_position_previous: { type: 'v2', value: new THREE.Vector2(0, 0) },
      brush_width: { type: 'f', value: 10.0 },
      brush_softness: { type: 'f', value: 1.0 },
    };

    this.compute = new Compute(this.renderSystem, standardVert, brushTipFrag, {
      resolution: this.resolution,
      uniforms: this.uniforms,
      createRenderTarget: true,
    });
  }

  update() {
    this.compute.run();
  }

  beginStroke() {
    this.strokeHasHistory = false;
    this.uniforms.brush_active.value = 1;
    this.uniforms.brush_active.needsUpdate = true;
  }

  endStroke() {
    this.uniforms.brush_active.value = 0;
    this.uniforms.brush_active.needsUpdate = true;
  }

  setBrushPosition(pos) {
    // if no line segment, just set previous to current
    if (this.useLineSegments && this.strokeHasHistory) {
      this.uniforms.brush_position_previous.value.copy(this.uniforms.brush_position.value);
    } else {
      this.uniforms.brush_position_previous.value.copy(pos);
    }

    this.uniforms.brush_position.value.copy(pos);

    this.uniforms.brush_position_previous.needsUpdate = true;
    this.uniforms.brush_position.needsUpdate = true;
    this.strokeHasHistory = true;
  }

  get output() {
    return this.compute.output;
  }
}

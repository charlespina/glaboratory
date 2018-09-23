import Compute from "../common/compute/Compute";
import RenderUtil from "../common/compute/RenderUtil";
import standardVert from "../common/StandardRaw.vert";
import paintFrag from "./shaders/Paint.frag";
import * as THREE from "three";

export default class Painter {
  constructor(brushTip, renderSystem, resolution,
    { brushColor = new THREE.Color(0x000000), initialColor = new THREE.Color(0x000000), initialAlpha = 1.0, fragShader = paintFrag}) {

    this.renderSystem = renderSystem;
    this.resolution = resolution;
    this.buffers = [
      RenderUtil.createRenderTarget(this.resolution, this.resolution),
      RenderUtil.createRenderTarget(this.resolution, this.resolution),
    ];

    RenderUtil.fillRenderTargets(this.renderSystem, this.buffers, initialColor, initialAlpha);

    this.uniforms = {
      brush_color: {
        type: 'c',
        value: brushColor,
      },
      brush_texture: {
        type: 't',
        value: brushTip.output,
      },
      canvas_texture: {
        type: 't',
        value: this.buffers[1],
      },
    };

    this.compute = new Compute(this.renderSystem, standardVert, fragShader, {
      resolution: this.resolution,
      uniforms: this.uniforms,
      createRenderTarget: false
    });

    this.output = this.compute.output = this.buffers[0];
  }

  setColor(color) {
    this.uniforms.brush_color.value = new THREE.Color(color);
    this.uniforms.brush_color.needsUpdate = true;
  }

  run() {
    this.swapBuffers();
    this.compute.run();
  }

  swapBuffers() {
    const tmp = this.buffers[0];
    this.buffers[0] = this.buffers[1];
    this.buffers[1] = tmp;

    this.compute.output = this.buffers[0];
    this.uniforms.canvas_texture.value = this.buffers[1];
    this.uniforms.canvas_texture.needsUpdate = true;
    this.output = this.buffers[0];
  }
}

import * as THREE from 'three';
import CopyPassFrag from './shaders/CopyPass.frag';
import ShaderPass from './ShaderPass';

export default class RenderPipeline {
  constructor(renderer) {
    this.renderer = renderer;
    const {width, height} = this.renderer.getSize();
    this.readBuffer = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      maxFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: false,
    });
    this.writeBuffer = this.readBuffer.clone();
    this.passes = [];
    this.copyPass = new ShaderPass({
      fragmentShader: CopyPassFrag,
    });
  }

  copy(dest) {
    const tmpWrite = this.writeBuffer;
    this.writeBuffer = dest;
    this.copyPass.render(this, 0);
    this.writeBuffer = tmpWrite;
  }

  addPass(pass) {
    this.passes.push(pass);
  }

  resize(w, h) {
    if (this.width == w && this.height == h) return;

    this.width = w;
    this.height = h;
    this.readBuffer.setSize(this.width, this.height);
    this.writeBuffer.setSize(this.width, this.height);
    this.passes.forEach((pass)=> {
      pass.setSize(this.width, this.height);
    });
  }

  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }

  render(dt) {
    this.passes.forEach((pass) => {
      pass.render(this, dt);
      this.swapBuffers();
    });
  }
}

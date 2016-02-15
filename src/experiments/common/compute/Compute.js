import THREE from 'three';
import RenderUtil from './RenderUtil';

/**
 * A class for running arbitrary shader programs on a screen-filling quad,
 * a common practice in general-purpose GPU computing. It makes it easy to
 * generate textures with the output of a shader program.
 */
export default class Compute {
  constructor(renderSystem, vertexShader, fragmentShader, { uniforms = {}, defines = {}, resolution = 512 }) {
    this.renderSystem = renderSystem;
    this.resolution = resolution;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
    this.camera.position.z = 2;

    const plane = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    const material = new THREE.RawShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms,
      defines,
    });
    this.quad = new THREE.Mesh(plane, material);
    this.scene.add(this.quad);
  }

  /**
   * Runs the shader program, returning the resultant texture.
   *
   * @return {THREE.WebGLRenderTarget}
   */
  run() {
    if (!this.output) {
      this.output = RenderUtil.createRenderTarget(this.resolution, this.resolution);
    }
    this.renderToTexture(this.output);
    return this.output;
  }

  /**
   * Renders the output of the program to the screen. Useful for debugging.
   */
  renderToScreen() {
    this.renderSystem.renderer.render(this.scene, this.camera);
  }

  /**
   * Renders the output of the shader program to the supplied render target.
   *
   * @param {THREE.WebGLRenderTarget} texture
   */
  renderToTexture(texture) {
    this.renderSystem.renderer.render(this.scene, this.camera, texture);
  }
}

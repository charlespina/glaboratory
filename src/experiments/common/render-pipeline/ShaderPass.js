import * as THREE from 'three';
import RenderPass from './RenderPass';
import StandardVert from '../Standard.vert';

export default class ShaderPass extends RenderPass {
  constructor({vertexShader=StandardVert, fragmentShader, uniforms, renderToScreen=false, textureName="texture"}) {
    super();
    this.uniforms = uniforms ? uniforms : { texture: { type: 't', value: null }};
    this.material = new THREE.ShaderMaterial({vertexShader, fragmentShader, uniforms: this.uniforms});
    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry( 2, 2 ), this.material);
    this.renderToScreen = renderToScreen;
    this.scene.add(this.quad);
    this.textureName = textureName;
  }

  render(pipeline, dt) {
    this.material.uniforms[this.textureName].value = pipeline.readBuffer;
    this.material.uniforms[this.textureName].needsUpdate = true;
    pipeline.renderer.render(this.scene, this.camera, this.renderToScreen ? null : pipeline.writeBuffer);
  }
}

import RenderPass from './RenderPass';

export default class SceneRenderPass extends RenderPass {
  constructor(scene, camera) {
    super();
    this.scene = scene;
    this.camera = camera;
  }

  render(pipeline, dt) {
    pipeline.renderer.render(this.scene, this.camera, pipeline.writeBuffer);
  }
}

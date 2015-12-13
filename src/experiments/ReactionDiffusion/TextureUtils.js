var THREE = require('../../lib/three');

function swapBuffers(buffers) {
  var tmp = buffers[1];
  buffers[1] = buffers[0];
  buffers[0] = tmp;
}

function clearBuffers(context, buffers, clearColor) {
  buffers.forEach(function(RTT) {
    var previousClearColor = context.renderer.getClearColor();
    if (clearColor)
      context.renderer.setClearColor(clearColor);
    context.renderer.clearTarget(RTT, true);
    if (clearColor)
      context.renderer.setClearColor(previousClearColor);
  });
}

export default {
  swapBuffers: swapBuffers,
  clearBuffers: clearBuffers,
  renderTextureSettings: {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.RenderTargetWrapping,
    wrapT: THREE.RenderTargetWrapping,
    format: THREE.RGBFormat,
    stencilBuffer: false,
    depthBuffer: false,
    type: THREE.FloatType
  }
};

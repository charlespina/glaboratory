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

module.exports = {
  swapBuffers: swapBuffers,
  clearBuffers: clearBuffers
};

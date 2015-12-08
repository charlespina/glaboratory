
var Trigger = function(name, onFire, hotKey) {
  this.name = name;
  this.type = 'trigger';
  this.onFire = onFire;
  this.hotKey = hotKey;
};

Trigger.prototype.fire = function() {
  if (this.onFire) this.onFire();
};

module.exports = Trigger;

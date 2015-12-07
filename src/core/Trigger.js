
var Trigger = function(name, onFire) {
  this.name = name;
  this.type = 'trigger';
  this.onFire = onFire;
};

Trigger.prototype.fire = function() {
  if (this.onFire) this.onFire();
};

module.exports = Trigger;

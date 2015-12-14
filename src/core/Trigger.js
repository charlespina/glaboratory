class Trigger {
  constructor(name, onFire, hotKey) {
    this.name = name;
    this.type = 'trigger';
    this.onFire = onFire;
    this.hotKey = hotKey;
  }

  fire() {
    if (this.onFire) this.onFire();
  }
}

export default Trigger;

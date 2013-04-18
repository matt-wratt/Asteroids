var Shotgun = (function() {

  function Shotgun(owner, position) {
    Weapon.call(this, {
      owner: owner,
      texture: 'textures/spark1.png',
      delay: 500,
      position: position,
      radius: 1,
      ttl: 100
    });
    this.pallets = 5;
    this.spread = 0.5;
  }

  Shotgun.prototype = Object.create(Weapon.prototype);

  Shotgun.prototype.releaseProjectile = function() {
    this.sound.play();
    for(var i = 0; i < this.pallets; ++i) {
      var options = this.getReleaseOptions();
      options.direction.x += this.spread * (Math.random() - 0.5);
      options.direction.y += this.spread * (Math.random() - 0.5);
      new Projectile(options);
    }
  };

  return Shotgun;

}());

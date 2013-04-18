var HomingShot = (function() {

  function HomingShot(owner, position) {
    Weapon.call(this, {
      owner: owner,
      texture: 'textures/shot1.png',
      delay: 500,
      force: 50,
      position: position,
      radius: 1,
      ttl: 100
    });
  }

  HomingShot.prototype = Object.create(Weapon.prototype);

  HomingShot.prototype.releaseProjectile = function() {
    this.sound.play();
    new HomingProjectile(this.getReleaseOptions());
  };

  return HomingShot;

}());

var HomingProjectile = (function() {

  function HomingProjectile(options) {
    Projectile.call(this, options);
  }

  HomingProjectile.prototype = Object.create(Projectile.prototype);

  HomingProjectile.prototype.update = function() {
    var self = this;
    Game.map.asteroids.each(function(asteroid) {
      self.physBody.pullTo(asteroid.physBody);
    });
    Projectile.prototype.update.call(this);
    var velocity = this.physBody.velocity();
    this.sceneBody.rotation = Math.atan2(velocity.y, velocity.x) - Math.PI / 2;
  };

  return HomingProjectile;

}());

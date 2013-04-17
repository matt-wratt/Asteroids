var Weapon = (function() {

  function Weapon(options) {
    this.options = options;
    var texture = THREE.ImageUtils.loadTexture(options.texture);
    options.material = new THREE.SpriteMaterial({map: texture, useScreenCoordinates: false, color: 0xA3CF16});
    this.firing = false;
    this.nextRound = 0;
    Game.entities.add(this);
  }

  Weapon.prototype = {
    fire: function() {
      this.firing = true;
    },
    update: function() {
      if(this.firing) {
        time = new Date().valueOf();
        if(time > this.nextRound) {
          this.nextRound = time + this.options.delay;
          this.releaseProjectile();
        }
      }
      this.firing = false;
    },
    releaseProjectile: function() {
      var pos = new THREE.Vector3();
      var dir = new THREE.Vector3(0, -1, 0);
      this.options.position.localToWorld(pos);
      this.options.position.localToWorld(dir);
      dir.sub(pos).normalize();
      this.options.direction = dir;
      this.options.x = pos.x;
      this.options.y = pos.y;
      var options = {
        group: 'projectile',
        hits: ['asteroid'],
        bullet: true,
        x: pos.x,
        y: pos.y,
        direction: dir,
        radius: this.options.radius,
        ttl: this.options.ttl,
        owner: this,
        material: this.options.material
      }
      new Projectile(options);
    }
  };

  return Weapon;

}());

var Projectile = (function() {

  function Projectile(options) {
    this.ttl = options.ttl;
    this.owner = options.owner;
    options.userData = {ent: this};
    this.physBody = new PhysicsBody(options);
    var f = 100;
    options.direction.multiplyScalar(f);
    this.physBody.applyImpulse(options.direction);
    this.sceneBody = new THREE.Sprite(options.material)
    this.sceneBody.scale.set(0.02, 0.02, 1);
    Game.scene.add(this.sceneBody);
    Game.entities.add(this);
  }

  Projectile.prototype = {
    update: function() {
      this.physBody.positionObject(this.sceneBody);
      this.ttl--; 
      if(this.ttl == 0 || this._dead) this.remove();
    },

    onTouch: function(body) {
      victum = body.GetUserData().ent;
      if(victum.type == ASTEROID) {
        victum.kill();
      }
      this._dead = true;
    },

    remove: function() {
      this.physBody.remove();
      Game.scene.remove(this.sceneBody);
      Game.entities.remove(this);
    }
  };

  return Projectile;

}());

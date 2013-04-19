var Weapon = (function() {

  function Weapon(options) {
    this.options = options;
    this.sound = new SoundPicker([
      'sounds/gun_1.wav',
      'sounds/gun_2.wav',
      'sounds/gun_3.wav'
    ]);
    var texture = THREE.ImageUtils.loadTexture(options.texture);
    options.material = new THREE.SpriteMaterial({map: texture, useScreenCoordinates: false, color: options.color || 0xA3CF16});
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
    getReleaseOptions: function() {
      var pos = new THREE.Vector3();
      var dir = new THREE.Vector3(0, -1, 0);
      this.options.position.localToWorld(pos);
      this.options.position.localToWorld(dir);
      dir.sub(pos).normalize();
      this.options.direction = dir;
      this.options.x = pos.x;
      this.options.y = pos.y;
      return {
        group: 'projectile',
        hits: ['asteroid'],
        bullet: true,
        x: pos.x,
        y: pos.y,
        direction: dir,
        radius: this.options.radius,
        force: this.options.force || 100,
        ttl: this.options.ttl,
        owner: this.options.owner,
        material: this.options.material
      }
    },
    releaseProjectile: function() {
      this.sound.play();
      new Projectile(this.getReleaseOptions());
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
    options.direction.multiplyScalar(options.force).add(options.owner.physBody.motion());
    this.physBody.applyImpulse(options.direction);
    this.sceneBody = new THREE.Sprite(options.material)
    var s = 0.03;
    this.sceneBody.scale.set(s, s, 1);
    this.sceneBody.rotation = Math.atan2(options.direction.y, options.direction.x) - Math.PI / 2;
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

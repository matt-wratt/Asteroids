var Player = (function() {

  var maxLives = 6;
  var Vec2 = Box2D.Common.Math.b2Vec2;

  function Player() {
    this.sounds = {
      spawn: SoundManager.loadAsync('sounds/spawn.wav'),
      shield: SoundManager.loadAsync('sounds/shield.wav'),
      alert: SoundManager.loadAsync('sounds/alert.wav'),
      death: SoundManager.loadAsync('sounds/die.wav'),
      shot: SoundManager.loadAsync('sounds/gun.wav'),
      engine: SoundManager.loadAsync('sounds/thrust.wav')
    };
    this.sounds.shield.volume = 0.5;
    this.sounds.alert.volume = 0.1;
    this.sounds.shot.volume = 0.5;
    this.sounds.engine.volume = 0.2;
    this.lives = maxLives;
    this.ship = this.buildShip();
    this.nextShot = 0;
    this.motion = new THREE.Vector3();
    this.rotationSpeed = 0.1;
    this.stoppingPower = 0.95;
    this.thrustOffset = -Math.PI / 2;
    this.nextShields = 0;
    this.radius = 30;
    this.dead = false;
    this.godMode();
    this.physBody = new PhysicsBody({
      group: 'player',
      hits: ['asteroid'],
      userData: {ent: this},
      x: 0,
      y: 0,
      radius: 30,
      angularDamping: 1.0
    });
    this.weapon = new Weapon({
      owner: this,
      texture: 'textures/spark1.png',
      delay: 200,
      position: this.gunPosition,
      radius: 1,
      ttl: 100
    });
    Game.scene.add(this.ship);
    Game.entities.add(this);
  }

  Player.prototype = {

    onTouch: function(body) {
      var ent = body.GetUserData().ent;
      if(!(ent.owner && ent.owner == this)) {
        this.die();
      }
    },

    die: function() {
      if(new Date().valueOf() > this.godModeEnd) {
        this.dead = true;
      }
    },

    kill: function() {
      this.dead = false;
      this.sounds.death.play();
      this.lives--;
      Game.particles.explode(this.ship.position, new THREE.Color(0x154492), 1000);
      if(this.lives == 0) {
        this.sounds.alert.stop();
        Game.lost();
      } else {
        this.sounds.spawn.play();
        if(this.lives == 1) {
          this.sounds.alert.play({loop: true});
        }
        this.physBody.teleport(new THREE.Vector3());
        this.physBody.clearForces();
        this.ship.rotation.set(0, 0, Math.PI);
        this.godMode();
      }
    },

    godMode: function() {
      if(this.hasShield) return;
      this.godModeEnd = new Date().valueOf() + 2000;
      this.ship.add(this.shield);
      this.hasShield = true;
      this.sounds.shield.play({loop: true});
    },

    buildShip: function() {
      var shield = new THREE.Mesh(new THREE.SphereGeometry(40), new THREE.MeshBasicMaterial({color: 0x0000ff, opacity: 0.3, transparent: true, blending: THREE.AdditiveBlending, wireframe: true}));
      var body = new THREE.Mesh(new THREE.SphereGeometry(30), new THREE.MeshLambertMaterial({color: 0x888888, ambient: 0x333333}));
      var cockpit = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshLambertMaterial({color: 0x0000ff, ambient: 0x000033}));
      var tail = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshLambertMaterial({color: 0x888888, ambient: 0x333333}));

      shield.material.blending = 'AdditiveAlphaBlending';
      this.shield = shield;

      this.gunPosition = new THREE.Object3D();
      this.gunPosition.position.set(0, -35, 0);

      body.scale.z = 0.3;
      cockpit.position.z = 8;
      cockpit.scale.y = 2;
      tail.position.y = 25;
      tail.position.z = 5;
      tail.scale.x = 0.2;

      var ship = new THREE.Object3D();
      this.glideAngle = new THREE.Object3D();
      this.glideAngle.add(body);
      this.glideAngle.add(cockpit);
      this.glideAngle.add(tail);

      ship.add(this.glideAngle);

      ship.rotation.z += Math.PI;

      ship.add(this.gunPosition);

      return ship;
    },

    thrust: function() {
      this.engineThrust();
    },

    right: function() {
      //this.ship.rotation.z -= this.rotationSpeed;
      this.physBody.body.ApplyTorque(-1000);
      this.glideAngle.rotation.y = -0.2;
    },

    left: function() {
      // this.ship.rotation.z += this.rotationSpeed;
      this.physBody.body.ApplyTorque(1000);
      this.glideAngle.rotation.y = 0.2;
    },

    action1: function() {
      this.weapon.fire();
    },

    action2: function() {
    },

    action3: function() {
      var time = new Date().valueOf();
      if(this.nextShields < time) {
        this.nextShields = new Date().valueOf() + 10000;
        this.godMode();
      }
    },

    update: function() {
      if(this.dead) {
        this.kill();
        return;
      }
      this.updateShields();

      this.glideAngle.rotation.y = 0;

      this.updatePosition();
    },

    updateShields: function() {
      if(new Date().valueOf() > this.godModeEnd && this.hasShield) {
        this.hasShield = false;
        this.ship.remove(this.shield);
        this.sounds.shield.stop();
      }
      this.shield.rotation.x += 0.1;
      this.shield.rotation.y += 0.1;
    },

    updatePosition: function() {
      this.physBody.positionObject(this.ship);
      this.physBody.setAngle(this.ship.rotation.z);
    },

    engineThrust: function() {
      var engine = new THREE.Vector3(0, 35, 0);
      var position = this.ship.localToWorld(engine);
      var angle = this.ship.rotation.z - Math.PI / 2;
      var f = 20000;
      var force = new THREE.Vector2(
        Math.cos(angle) * f,
        Math.sin(angle) * f
      );
      this.physBody.applyForce(force);
      var direction = position.clone().sub(this.ship.position).normalize();
      direction.multiplyScalar(5);
      direction.add(this.physBody.motion())
      if(!this.sounds.engine.playing()) {
        this.sounds.engine.play({loop: false});
      }
      Game.particles.cone(position, direction, new THREE.Color(0x154492), 20);
    },

    shoot: function() {
      var gun = new THREE.Vector3(0, -25, 0);
      var position = this.ship.localToWorld(gun);
      var direction = position.clone().sub(this.ship.position).normalize();

      direction.multiplyScalar(20).add(this.physBody.motion());

      time = new Date().valueOf();
      if(time > this.nextShot) {
        this.sounds.shot.play();
        Game.particles.shoot(position, direction, new THREE.Color(0x99ff33), 100);
        this.nextShot = time + 50;
      }
    }
  };

  return Player;

}());

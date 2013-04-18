var Player = (function() {

  var maxLives = 6;
  var Vec2 = Box2D.Common.Math.b2Vec2;

  function Player(app, entities) {
    this.sounds = {
      spawn: SoundManager.loadAsync('sounds/spawn.wav'),
      shield: SoundManager.loadAsync('sounds/shield.wav'),
      alert: SoundManager.loadAsync('sounds/alert.wav'),
      death: SoundManager.loadAsync('sounds/die.wav'),
      engine: SoundManager.loadAsync('sounds/thrust.wav')
    };
    this.sounds.shield.volume = 0.5;
    this.sounds.alert.volume = 0.1;
    this.sounds.engine.volume = 0.2;
    this.app = app;
    entities.push(this);
    if(app.player) {
      this.lives = app.player.lives;
    } else {
      this.lives = maxLives;
    }
    this.ship = this.buildShip();
    this.guns = new Guns();
    this.motion = new THREE.Vector3();
    this.rotationSpeed = 0.1;
    this.thrust = 0.1;
    this.stoppingPower = 0.95;
    this.thrustOffset = -Math.PI / 2;
    this.nextShields = 0;
    this.radius = 30;
    this.dead = false;
    this.godMode();
    this.physBody = new PhysicsBody({
      userData: {ent: this},
      x: 0,
      y: 0,
      radius: 30,
      angularDamping: 1.0
    });
  }

  Player.prototype = {
    addTo: function(scene) {
      scene.add(this.ship);
      scene.add(this.guns.system);
      scene.add(this.livesObj);
      this.sounds.spawn.play();
    },

    won: function() {
      this.app.playerWon();
    },

    onTouch: function() {
      this.die();
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
      ParticleManager.explode(this.ship.position, new THREE.Color(0x154492), 1000);
      if(this.lives == 0) {
        this.sounds.alert.stop();
        this.app.playerDied();
      } else {
        this.sounds.spawn.play();
        if(this.lives == 1) {
          this.sounds.alert.play({loop: true});
        }
        this.livesObj.remove(this.livesObj.children[this.lives - 1]);
        this.physBody.teleport(new THREE.Vector3());
        this.physBody.clearForces();
        this.ship.rotation.set(0, 0, Math.PI);
        this.guns.clear();
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

      this.livesObj = new THREE.Object3D();
      var lifeShip = ship.clone();
      lifeShip.scale.set(0.4, 0.4, 0.4);
      lifeShip.position.set(-100, innerHeight/2 - 30, 100);
      for(var i = 0; i < this.lives - 1; ++i) {
        //lifeShip.translateX(-30);
        this.livesObj.add(lifeShip.clone());
      }

      return ship;
    },

    update: function(input) {
      if(this.dead) {
        this.kill();
        return;
      }

      var actions = input.actions;

      if(actions.shields) {
        var time = new Date().valueOf();
        if(this.nextShields < time) {
          this.nextShields = new Date().valueOf() + 10000;
          this.godMode();
        }
      }
      this.updateShields();

      if(actions.guns_guns_guns) {
        this.shoot();
      }
      this.guns.update();

      this.glideAngle.rotation.y = 0;
      if(actions.rotate_right) {
        this.ship.rotation.z -= this.rotationSpeed;
        this.glideAngle.rotation.y = -0.2;
      }
      if(actions.rotate_left) {
        this.ship.rotation.z += this.rotationSpeed;
        this.glideAngle.rotation.y = 0.2;
      }
      if(actions.thrust) {
        this.engineThrust();
      } else {
        this.sounds.engine.stop();
      }
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
        this.sounds.engine.play({loop: true});
      }
      ParticleManager.cone(position, direction, new THREE.Color(0x154492), 20);
    },

    shoot: function() {
      var gun = new THREE.Vector3(0, -25, 0);
      var position = this.ship.localToWorld(gun);
      var direction = position.clone().sub(this.ship.position).normalize();
      this.guns.shoot(position, direction, this.physBody.motion());
    },

    getShots: function() {
      return this.guns.particles;
    }
  };

  return Player;

}());

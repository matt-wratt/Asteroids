var Player = (function() {

  var maxLives = 6;

  function Player(app, entities) {
    this.sounds = {
      spawn: SoundManager.loadAsync('sounds/spawn.wav'),
      shield: SoundManager.loadAsync('sounds/shield.wav'),
      alert: SoundManager.loadAsync('sounds/alert.wav'),
      death: SoundManager.loadAsync('sounds/die.wav')
    };
    this.sounds.shield.volume = 0.5;
    this.sounds.alert.volume = 0.1;
    this.app = app;
    entities.push(this);
    if(app.player) {
      this.lives = app.player.lives;
    } else {
      this.lives = maxLives;
    }
    this.ship = this.buildShip();
    this.engine = new Engine();
    this.guns = new Guns();
    this.motion = new THREE.Vector2(0, 0);
    this.rotationSpeed = 0.1;
    this.thrust = 0.1;
    this.stoppingPower = 0.95;
    this.thrustOffset = -Math.PI / 2;
    this.nextShields = 0;
    this.radius = 30;
    this.godMode();
  }

  Player.prototype.addTo = function(scene) {
    scene.add(this.ship);
    scene.add(this.engine.system);
    scene.add(this.guns.system);
    scene.add(this.livesObj);
    this.sounds.spawn.play();
  };

  Player.prototype.won = function() {
    this.app.playerWon();
  };

  Player.prototype.kill = function() {
    if(new Date().valueOf() > this.godModeEnd) {
      this.sounds.death.play();
      this.lives--;
      this.engine.explode(this.ship.position);
      if(this.lives == 0) {
        this.sounds.alert.stop();
        this.app.playerDied();
      } else {
        this.sounds.spawn.play();
        if(this.lives == 1) {
          this.sounds.alert.play({loop: true});
        }
        this.livesObj.remove(this.livesObj.children[this.lives - 1]);
        this.ship.position.set(0, 0, 0);
        this.motion.set(0, 0, 0);
        this.ship.rotation.set(0, 0, Math.PI);
        this.guns.clear();
        this.godMode();
      }
      return true;
    }
    return false;
  };

  Player.prototype.godMode = function() {
    this.godModeEnd = new Date().valueOf() + 2000;
    this.ship.add(this.shield);
    this.hasShield = true;
    this.sounds.shield.play({loop: true});
  };

  Player.prototype.buildShip = function() {
    var shield = new THREE.Mesh(new THREE.SphereGeometry(40), new THREE.MeshBasicMaterial({color: 0x0000ff, opacity: 0.3, transparent: true, blending: THREE.AdditiveBlending, wireframe: true}));
    var body = new THREE.Mesh(new THREE.SphereGeometry(30), new THREE.MeshLambertMaterial({color: 0x888888, ambient: 0x333333}));
    var cockpit = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshLambertMaterial({color: 0x0000ff, ambient: 0x000033}));
    var tail = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshLambertMaterial({color: 0x888888, ambient: 0x333333}));

    shield.material.blending = 'AdditiveAlphaBlending';
    this.shield = shield

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
      lifeShip.translateX(-30);
      this.livesObj.add(lifeShip.clone());
    }

    return ship;
  };

  Player.prototype.update = function(input) {
    var actions = input.actions;
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
      this.motion.x += Math.cos(this.ship.rotation.z + this.thrustOffset) * this.thrust;
      this.motion.y += Math.sin(this.ship.rotation.z + this.thrustOffset) * this.thrust;
    }
    if(actions.shields) {
      var time = new Date().valueOf();
      if(this.nextShields < time) {
        this.nextShields = new Date().valueOf() + 10000;
        this.godMode();
      }
    }
    if(actions.guns_guns_guns) {
      this.shoot();
    }
    this.ship.position.x += this.motion.x;
    this.ship.position.y += this.motion.y;
    if(Math.abs(this.ship.position.x) > innerWidth/2) this.ship.position.x *= -1;
    if(Math.abs(this.ship.position.y) > innerHeight/2) this.ship.position.y *= -1;
    this.engine.update();
    this.guns.update();
    if(new Date().valueOf() > this.godModeEnd && this.hasShield) {
      this.hasShield = false;
      this.ship.remove(this.shield);
      this.sounds.shield.stop();
    }
    this.shield.rotation.x += 0.1;
    this.shield.rotation.y += 0.1;
  };

  Player.prototype.engineThrust = function() {
    var engine = new THREE.Vector3(0, 25, 0);
    var position = this.ship.localToWorld(engine);
    var direction = position.clone().sub(this.ship.position).normalize();
    this.engine.thrust(position, direction, this.motion);
  };

  Player.prototype.shoot = function() {
    var gun = new THREE.Vector3(0, -25, 0);
    var position = this.ship.localToWorld(gun);
    var direction = position.clone().sub(this.ship.position).normalize();
    this.guns.shoot(position, direction, this.motion);
  };

  Player.prototype.getShots = function() {
    return this.guns.particles;
  };

  return Player;

}());

var Player = (function() {

  function Player(entities) {
    entities.push(this);
    this.ship = this.buildShip();
    this.engine = new Engine();
    this.guns = new Guns();
    this.motion = new THREE.Vector2(0, 0);
    this.rotationSpeed = 0.1;
    this.thrust = 0.1;
    this.stoppingPower = 0.95;
    this.thrustOffset = -Math.PI / 2;
  }

  Player.prototype.addTo = function(scene) {
    scene.add(this.ship);
    scene.add(this.engine.system);
    scene.add(this.guns.system);
  };

  Player.prototype.buildShip = function() {
    var body = new THREE.Mesh(new THREE.SphereGeometry(30), new THREE.MeshLambertMaterial({color: 0x888888, ambient: 0x333333}));
    var cockpit = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshLambertMaterial({color: 0x0000ff, ambient: 0x000033}));
    var tail = new THREE.Mesh(new THREE.SphereGeometry(10), new THREE.MeshLambertMaterial({color: 0x888888, ambient: 0x333333}));

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
    if(actions.brake) {
      this.motion.x *= this.stoppingPower;
      this.motion.y *= this.stoppingPower;
    }
    if(actions.guns_guns_guns) {
      this.shoot(); 
    }
    this.ship.position.x += this.motion.x;
    this.ship.position.y += this.motion.y;
    this.engine.update();
    this.guns.update();
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

  return Player;

}());

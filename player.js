var Player = (function() {

  function Player() {
    this.ship = this.buildShip();
    this.motion = new THREE.Vector2(0, 0);
    this.rotationSpeed = 0.1;
    this.thrust = 0.1;
    this.stoppingPower = 0.7;
    this.thrustOffset = -Math.PI / 2;
  }

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
    ship.add(body);
    ship.add(cockpit);
    ship.add(tail);

    return ship;
  };

  Player.prototype.update = function(actions) {
    if(actions.rotate_right) this.ship.rotation.z -= this.rotationSpeed;
    if(actions.rotate_left) this.ship.rotation.z += this.rotationSpeed;
    if(actions.thrust) {
      this.motion.x += Math.cos(this.ship.rotation.z + this.thrustOffset) * this.thrust;
      this.motion.y += Math.sin(this.ship.rotation.z + this.thrustOffset) * this.thrust;
    }
    if(actions.brake) {
      this.motion.x *= this.stoppingPower;
      this.motion.y *= this.stoppingPower;
    }
    this.ship.position.x += this.motion.x;
    this.ship.position.y += this.motion.y;
  };

  return Player;

}());

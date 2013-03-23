var Player = (function() {

  function Player(entities) {
    entities.push(this);
    this.ship = this.buildShip();
    this.buildEngineTrail(entities);
    this.motion = new THREE.Vector2(0, 0);
    this.rotationSpeed = 0.1;
    this.thrust = 0.1;
    this.stoppingPower = 0.95;
    this.thrustOffset = -Math.PI / 2;
  }

  Player.prototype.addTo = function(scene) {
    scene.add(this.ship);
    for(var i = 0; i < this.trail.length; ++i) {
      scene.add(this.trail[i].particle);
    }
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

  Player.prototype.buildEngineTrail = function(entities) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = 16;
    canvas.height = 16;

    var context = canvas.getContext( '2d' );
    var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
    gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
    gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
    gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    var material = new THREE.ParticleBasicMaterial({map: new THREE.Texture(canvas), blending: THREE.AdditiveBlending});
    this.trail = [];
    this.trail.next = -1;
    this.trail.getNext = function() {
      this.next = (this.next + 1) % this.length;
      return this[this.next];
    };
    for(var i = 0; i < 500; ++i) {
      var particle = new Particle(material);
      this.trail.push(particle);
      entities.push(particle);
    }
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
      this.spurtTrail();
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

  Player.prototype.spurtTrail = function() {
    var particle = this.trail.getNext();
    particle.setPosition(this.ship.position.x, this.ship.position.y, this.ship.position.z);    
    var mx = Math.cos(this.ship.rotation.z - this.thrustOffset);
    var my = Math.sin(this.ship.rotation.z - this.thrustOffset);
    particle.setMotion(mx, my, 0);
  };

  return Player;

}());

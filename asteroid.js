var Asteroid = (function() {

  function Asteroid(size, speed, position) {
    this.speed = speed;
    this.size = size;
    this.radius = this.size;
    this.rotation = (Math.random() - 0.5) / 10;
    this.direction = new THREE.Vector3(
      (Math.random() - 0.5) * this.speed,
      (Math.random() - 0.5) * this.speed, 
      0
    );
    var browns = [
      new THREE.Color(0x3C4639),
      new THREE.Color(0x98835B),
      new THREE.Color(0x151B1F),
      new THREE.Color(0x524026)
    ]
    var color = browns[Math.floor(Math.random() * browns.length)];
    var ambient = color.clone();
    ambient.r = ambient.r * 0.4;
    ambient.g = ambient.g * 0.4;
    ambient.b = ambient.b * 0.4;
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(size), new THREE.MeshLambertMaterial({color: color, ambient: ambient}));
    if(position) {
      this.mesh.position.set(
        position.x,
        position.y,
        0
      );
    } else {
      this.mesh.position.set(
        Math.random() * innerWidth - innerWidth / 2,
        Math.random() * innerHeight - innerHeight / 2,
        0
      );
    }
    this.mesh.rotation.x = Math.random();
    this.mesh.rotation.y = Math.random();
    this.id = this.mesh.id;
  }

  Asteroid.prototype.kill = function() {
    asteroidKillCount++;
    this.dead = true;
  };

  Asteroid.prototype.update = function(map, player) {
    if(this.dead) {
      this.die(map);
    } else {
      this.hitTest(player);
      this.updatePosition();
    }
  };

  Asteroid.prototype.hitTest = function(player) {
    var length = player.ship.position.clone().sub(this.mesh.position).length();
    if(length < this.radius + player.radius) {
      player.kill();
    }
  };

  Asteroid.prototype.die = function(map) {
    if(this.size > 20) {
      var size = this.size * 0.8;
      for(var i = 0; i < 2; ++i) {
        map.addAsteroid(size, this.mesh.position);
      }
    }
    map.map.remove(this.mesh);
    delete map.asteroids[this.id];
  };

  Asteroid.prototype.updatePosition = function() {
    this.mesh.position.add(this.direction);
    this.mesh.position.z = 0;
    this.mesh.rotation.z += this.rotation;
    if(Math.abs(this.mesh.position.x) > innerWidth/2) this.mesh.position.x *= -1;
    if(Math.abs(this.mesh.position.y) > innerHeight/2) this.mesh.position.y *= -1;
  };

  return Asteroid;

}());

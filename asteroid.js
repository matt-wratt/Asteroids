var ASTEROID = 'Asteroid';
var Asteroid = (function() {

  function Asteroid(size, speed, position) {
    this.dieSound = new SoundPicker([
      'sounds/asteroid_die_1.wav',
      'sounds/asteroid_die_2.wav',
      'sounds/asteroid_die_3.wav',
      'sounds/asteroid_die_4.wav'
    ]);
    this.type = ASTEROID;
    this.speed = speed * 1000;
    this.size = size;
    this.radius = this.size;
    this.rotation = (Math.random() - 0.5) / 10;
    this.direction = new THREE.Vector3(
      (Math.random() - 0.5) * this.speed,
      (Math.random() - 0.5) * this.speed,
      0
    );
    var asteroidColors = [
      0x3C4639,
      0x98835B,
      0x151B1F,
      0x524026
    ];
    var color = new THREE.Color(0xffffff);
    var ambient = color.clone();
    ambient.r *= 0.2;
    ambient.g *= 0.2;
    ambient.b *= 0.2;

    var faceIndices = [ 'a', 'b', 'c', 'd' ];
    var geometry = new THREE.SphereGeometry(size);
    var colors = {};
    for(var i = 0; i < geometry.faces.length; ++i) {
      var f = geometry.faces[i];
      var n = ( f instanceof THREE.Face3 ) ? 3 : 4;
      for(var j = 0; j < n; ++j) {
        vertexIndex = f[ faceIndices[ j ] ];
        if(!colors[vertexIndex]) {
          colors[vertexIndex] = new THREE.Color(asteroidColors[Math.floor(Math.random() * asteroidColors.length)]);
        }
        f.vertexColors[ j ] = colors[vertexIndex];
      }
    }
    var material = new THREE.MeshLambertMaterial({color: color, ambient: ambient, vertexColors: THREE.VertexColors});
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.set(
      Math.random() - 0.5,
      Math.random() - 0.5,
      0
    );
    this.id = this.mesh.id;

    if(!position) {
      position = {
        x: (Math.random() - 0.5) * innerWidth,
        y: (Math.random() - 0.5) * innerHeight
      };
    }
    this.mesh.position.x = position.x;
    this.mesh.position.y = position.y;
    this.physBody = new PhysicsBody({
      userData: {ent: this},
      x: position.x,
      y: position.y,
      radius: size,
      bullet: true,
      group: 'asteroid',
      hits: ['player', 'projectile', 'asteroid']
    });
    this.physBody.applyImpulse(this.direction);
    this.physBody.applyTorque(Math.random() * 10000);
  }

  Asteroid.prototype = {
    kill: function() {
      asteroidKillCount++;
      this.dead = true;
    },

    update: function() {
      var self = this;
      if(Game.gravity) {
        Game.map.asteroids.each(function(asteroid) {
          if(self != asteroid) {
            self.physBody.pullTo(asteroid.physBody);
          }
        });
      }
      this.physBody.positionObject(this.mesh);
    },

    die: function() {
      if(this.size > 20) {
        var size = this.size * 0.8;
        for(var i = 0; i < 2; ++i) {
          Game.map.addAsteroid(size, this.mesh.position);
        }
      }
      Game.particles.explode(this.mesh.position, new THREE.Color(0xdd380c), this.size * 10);
      this.physBody.remove();
      this.dieSound.play();
    }
  };

  return Asteroid;

}());

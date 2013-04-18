var ASTEROID = 'Asteroid';
var Asteroid = (function() {

  var map = THREE.ImageUtils.loadCompressedTexture( 'textures/disturb_dxt1_mip.dds' );

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
    var browns = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xcccccc),
      new THREE.Color(0xaaaaaa)
    ];
    var color = browns[Math.floor(Math.random() * browns.length)];
    var ambient = color.clone();
    ambient.r *= 0.2;
    ambient.g *= 0.2;
    ambient.b *= 0.2;

    var geometry = new THREE.SphereGeometry(size);
    var material = new THREE.MeshLambertMaterial({map: map, color: color, ambient: ambient});
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

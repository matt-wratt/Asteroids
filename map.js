var Map = (function() {

  function Map(player, asteroids, speed) {
    this.speed = speed;
    this.player = player;
    this.map = new THREE.Object3D();
    this.particles = new AsteroidExplosion();
    this.map.add(this.particles.system);
    this.asteroids = {};
    for(var i = 0; i < asteroids; ++i) {
      this.addAsteroid(50);
    }
  }

  Map.prototype.addAsteroid = function(size, position) {
    var asteroid = new Asteroid(size, Math.random() * this.speed, position);
    this.map.add(asteroid.mesh);
    this.asteroids[asteroid.id] = asteroid;
  };

  Map.prototype.addTo = function(scene) {
    scene.add(this.map);
  };

  Map.prototype.update = function() {
    var shots = this.player.getShots();
    var caster = new THREE.Raycaster();
    for(var i = 0; i < shots.length; ++i) {
      var shot = shots[i];
      if(shot.speed != 0) {
        caster.far = shot.speed;
        caster.set(shot.position.clone(), shot.motion.clone());
        hits = caster.intersectObject(this.map, true)
        if(hits.length) {
          shot.remove();
          for(var j = 0; j < hits.length; ++j) {
            var mesh = hits[j].object;
            this.particles.explode(mesh.position);
            this.asteroids[mesh.id].kill();
          }
        }
      }
    }
    var asteroids = false;
    for(var i in this.asteroids) {
      asteroids = true;
      var asteroid = this.asteroids[i];
      asteroid.update(this, this.player);
    }
    if(!asteroids) {
      this.player.won();
    }
    this.particles.update();
  };

  return Map;

}());

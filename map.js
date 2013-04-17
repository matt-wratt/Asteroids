var Map = (function() {

  function Map(asteroids, speed) {
    this.speed = speed;
    this.map = new THREE.Object3D();
    this.asteroids = new ManagedArray();
    for(var i = 0; i < asteroids; ++i) {
      this.addAsteroid(50);
    }
    Game.entities.add(this);
    Game.scene.add(this.map);
  }

  Map.prototype = {
    addAsteroid: function(size, position) {
      var asteroid = new Asteroid(size, Math.random() * this.speed, position);
      this.map.add(asteroid.mesh);
      this.asteroids.add(asteroid);
    },

    update: function() {
      var self = this;
      this.asteroids.each(function(asteroid) {
        if(asteroid.dead) {
          self.asteroids.remove(asteroid);
          self.map.remove(asteroid.mesh);
          asteroid.die();
        } else {
          asteroid.update();
        }
      });
    },

    complete: function() {
      return this.asteroids.isEmpty();
    }
  };

  return Map;

}());

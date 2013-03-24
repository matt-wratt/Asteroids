var AsteroidExplosion = (function() {

  function AsteroidExplosion() {
    var material = new THREE.ParticleBasicMaterial({size: 50, map: THREE.ImageUtils.loadTexture('textures/spark1.png'), blending: THREE.AdditiveBlending, transparent: true});
    material.color.setRGB(1, .3, .3);
    this.particles = [];
    this.next = -1;
    var particleGeometry = new THREE.Geometry();
    for(var i = 0; i < 500; ++i) {
      var particle = new Particle();
      this.particles.push(particle);
      particleGeometry.vertices.push(particle.position);
    }
    this.system = new THREE.ParticleSystem(particleGeometry, material);
  }

  AsteroidExplosion.prototype.nextParticle = function() {
    this.next = (this.next + 1) % this.particles.length;
    return this.particles[this.next];
  };

  AsteroidExplosion.prototype.explode = function(position) {
    var i = ++this.next;
    var end = (i + 100) % this.particles.length;
    this.next = end;
    while(i != end) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 10;
      this.particles[i].init(
        position,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0,
        Math.floor(Math.random() * 20)
      );
      i = (i + 1) % this.particles.length;
    }
  };

  AsteroidExplosion.prototype.clear = function() {
    for(var i = 0; i < this.particles.length; ++i) {
      this.particles[i].remove();
    }
  };

  AsteroidExplosion.prototype.update = function() {
    this.system.geometry.verticesNeedUpdate = true;
    for(var i = 0; i < this.particles.length; ++i) {
      this.particles[i].update();
    }
  };

  return AsteroidExplosion;

}());

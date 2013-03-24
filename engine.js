var Engine = (function() {

  function Engine() {
    var material = new THREE.ParticleBasicMaterial({size: 50, map: THREE.ImageUtils.loadTexture('textures/spark1.png'), blending: THREE.AdditiveBlending, transparent: true});
    material.color.setRGB(0.3, 0.3, 1);
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

  Engine.prototype.nextParticle = function() {
    this.next = (this.next + 1) % this.particles.length;
    return this.particles[this.next];
  };

  Engine.prototype.thrust = function(position, direction, motion) {
    var particle = this.nextParticle();
    particle.init(
      position,
      direction.x * 5 + Math.random() - 0.5 + motion.x,
      direction.y * 5 + Math.random() - 0.5 + motion.y,
      0
    );
  };

  Engine.prototype.explode = function(position) {
    for(var i = 0; i < this.particles.length; ++i) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 10;
      this.particles[i].init(
        position,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0
      );
    }
  };

  Engine.prototype.clear = function() {
    for(var i = 0; i < this.particles.length; ++i) {
      this.particles[i].remove();
    }
  };

  Engine.prototype.update = function() {
    this.system.geometry.verticesNeedUpdate = true;
    for(var i = 0; i < this.particles.length; ++i) {
      this.particles[i].update();
    }
  };

  return Engine;

}());

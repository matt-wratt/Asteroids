var Guns = (function() {

  function Guns() {
    var material = new THREE.ParticleBasicMaterial({size: 30, map: THREE.ImageUtils.loadTexture('spark1.png'), blending: THREE.AdditiveBlending, transparent: true});
    material.color.setRGB(1, 1, 0);
    this.particles = [];
    this.next = -1;
    var particleGeometry = new THREE.Geometry();
    for(var i = 0; i < 500; ++i) {
      var particle = new Particle();
      this.particles.push(particle);
      particleGeometry.vertices.push(particle.position);
    }
    this.system = new THREE.ParticleSystem(particleGeometry, material);
    this.nextShot = 0;
  }

  Guns.prototype.nextParticle = function() {
    this.next = (this.next + 1) % this.particles.length;
    return this.particles[this.next];
  };

  Guns.prototype.shoot = function(position, direction, motion) {
    time = new Date().valueOf();
    if(time > this.nextShot) {
      var particle = this.nextParticle();
      particle.init(
        position,
        direction.x * 10 + motion.x,
        direction.y * 10 + motion.y,
        0
      );
      this.nextShot = time + 200;
    }
  };

  Guns.prototype.update = function() {
    this.system.geometry.verticesNeedUpdate = true;
    for(var i = 0; i < this.particles.length; ++i) {
      this.particles[i].update();
    }
  };

  return Guns;

}());

var Guns = (function() {

  function Guns() {
    this.sound = SoundManager.loadAsync('sounds/gun.wav');
    this.sound.volume = 0.5;
    var material = new THREE.ParticleBasicMaterial({size: 40, map: THREE.ImageUtils.loadTexture('textures/spark1.png'), blending: THREE.AdditiveBlending, transparent: true});
    material.color.setRGB(0.4, 1, 0.1);
    this.particles = [];
    this.next = -1;
    var particleGeometry = new THREE.Geometry();
    for(var i = 0; i < 500; ++i) {
      var particle = new Particle(true);
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
      this.sound.play();
      var particle = this.nextParticle();
      particle.init(
        position,
        direction.x * 10 + motion.x,
        direction.y * 10 + motion.y,
        0,
        100
      );
      this.nextShot = time + 200;
    }
  };

  Guns.prototype.clear = function() {
    for(var i = 0; i < this.particles.length; ++i) {
      this.particles[i].remove();
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

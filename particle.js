var Particle = (function() {

  function Particle() {
    this.position = new THREE.Vector3(
      Math.random() * 500 - 250,
      Math.random() * 500 - 250,
      0
    );
    var size = Math.random() * 3 + 2;
    this.motion = new THREE.Vector3(0, 0, 0);
    this.ttl = 500;
  }

  Particle.prototype.setPosition = function(x, y, z) {
    this.position.set(x, y, z);
  };

  Particle.prototype.setMotion = function(x, y, z) {
    this.motion.set(x, y, z);
  };

  Particle.prototype.update = function() {
    this.position.add(this.motion);
  };

  return Particle;

}());

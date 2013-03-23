var Particle = (function() {

  function Particle(material) {
    this.particle = new THREE.Particle(material);
    this.particle.scale.x = 100;
    this.particle.scale.y = 100;
    this.particle.scale.z = 100;
    this.motion = new THREE.Vector3(0, 0, 0);
    this.ttl = 500;
  }

  Particle.prototype.setPosition = function(x, y, z) {
    this.particle.position.set(x, y, z);
    console.log(x, y, z);
  };

  Particle.prototype.setMotion = function(x, y, z) {
    this.motion.set(x, y, z);
  };

  Particle.prototype.update = function() {
    if(this.particle.parent) {
      //this.particle.position.add(this.motion);
    }
  };

  return Particle;

}());

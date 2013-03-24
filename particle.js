var Particle = (function() {

  function Particle(wrap) {
    this.wrap = wrap || false;
    this.position = new THREE.Vector3(0, 0, 1000);
    var size = Math.random() * 3 + 2;
    this.motion = new THREE.Vector3(0, 0, 0);
  }

  Particle.prototype.init = function(position, mx, my, mz, ttl) {
    this.ttl = ttl || 500;
    this.position.set(position.x, position.y, position.z);
    this.motion.set(mx, my, mz);
  }

  Particle.prototype.update = function() {
    if(this.ttl > 0) {
      this.position.add(this.motion);
      if(this.wrap) {
        if(Math.abs(this.position.x) > innerWidth/2) this.position.x *= -1;
        if(Math.abs(this.position.y) > innerHeight/2) this.position.y *= -1;
      }
      this.ttl--;
      if(this.ttl == 0) {
        this.position.z = 1000;
        this.motion.set(0, 0, 0); 
      }
    }
  };

  return Particle;

}());

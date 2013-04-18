var Blaster = (function() {

  function Blaster(owner, position) {
    Weapon.call(this, {
      owner: owner,
      texture: 'textures/shot1.png',
      delay: 200,
      position: position,
      radius: 1,
      ttl: 100
    });
  }

  Blaster.prototype = Object.create(Weapon.prototype);

  return Blaster;

}());

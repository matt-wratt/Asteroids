var PhysicsManager = (function() {

  var Vec2 = b2Vec2;
  var BodyDef = b2BodyDef;
  var Body = b2Body;
  var World = b2World;
  var MassData = b2MassData;
  var CircleShape = b2CircleShape;
  var RevoluteJointDef = b2RevoluteJointDef;


  function PhysicsManager() {
    this.PHYSICS_LOOP_HZ = 1.0 / 60.0
    var worldAABB = new b2AABB();
    worldAABB.minVertex.Set(-1000, -1000);
    worldAABB.maxVertex.Set(1000, 1000);
    var gravity = new b2Vec2(0, 0);
    this.world = new b2World(worldAABB, gravity, false);
  }

  PhysicsManager.prototype.addBody = function(entityDef) {
    var shape = new b2CircleDef();

    shape.density = 1.0;
    shape.friction = 0;
    shape.restitution = 1.0;
    shape.radius = entityDef.radius;

    var bodyDef = new BodyDef();

    bodyDef.AddShape(shape);

    bodyDef.position.Set(entityDef.x, entityDef.y);

    if(entityDef.userData)  bodyDef.userData = entityDef.userData;

    var body = this.registerBody(bodyDef);

    return body;
  };

  PhysicsManager.prototype.registerBody = function(bodyDef) {
    var body = this.world.CreateBody(bodyDef);
    return body;
  };

  PhysicsManager.prototype.update = function() {
    var start = Date.now();

    this.world.Step(this.PHYSICS_LOOP_HZ, 10, 10);
    // this.world.ClearForces();

    return(Date.now() - start);
  };
  
  PhysicsManager.prototype.removeBody = function(obj) {
    this.world.DestroyBody(obj);
  }

  return new PhysicsManager;

}());

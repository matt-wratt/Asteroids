var PhysicsManager = (function() {

  var Vec2 = Box2D.Common.Math.b2Vec2;
  var BodyDef = Box2D.Dynamics.b2BodyDef;
  var Body = Box2D.Dynamics.b2Body;
  var FixtureDef = Box2D.Dynamics.b2FixtureDef;
  var Fixture = Box2D.Dynamics.b2Fixture;
  var World = Box2D.Dynamics.b2World;
  var MassData = Box2D.Collision.Shapes.b2MassData;
  var PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  var CircleShape = Box2D.Collision.Shapes.b2CircleShape;
  var DebugDraw = Box2D.Dynamics.b2DebugDraw;
  var RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
  var AABB = Box2D.Collision.b2AABB;

  function PhysicsManager() {
    this.PHYSICS_LOOP_HZ = 1.0 / 60.0
    var worldAABB = new AABB();
    worldAABB.lowerBound.Set(-1000, -1000);
    worldAABB.upperBound.Set(1000, 1000);
    var gravity = new Vec2(0, 0);
    this.world = new World(gravity, false);
  }

  PhysicsManager.prototype.addBody = function(entityDef) {
    var bodyDef = new BodyDef();

    bodyDef.position.Set(entityDef.x, entityDef.y);

    if(entityDef.userData)  bodyDef.userData = entityDef.userData;

    bodyDef.type = Body.b2_dynamicBody;

    var body = this.registerBody(bodyDef);

    var fixtureDefinition = new FixtureDef();

    fixtureDefinition.density = 1.0;
    fixtureDefinition.friction = 0;
    fixtureDefinition.restitution = 1.0;

    fixtureDefinition.shape = new CircleShape();
    fixtureDefinition.shape.SetRadius(entityDef.radius);

    body.CreateFixture(fixtureDefinition);

    return body;
  };

  PhysicsManager.prototype.registerBody = function(bodyDef) {
    var body = this.world.CreateBody(bodyDef);
    return body;
  };

  PhysicsManager.prototype.update = function() {
    var start = Date.now();

    this.world.Step(this.PHYSICS_LOOP_HZ, 10, 10);
    this.world.ClearForces();

    return(Date.now() - start);
  };
  
  PhysicsManager.prototype.removeBody = function(obj) {
    this.world.DestroyBody(obj);
  }

  return new PhysicsManager;

}());

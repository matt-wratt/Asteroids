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

    if(entityDef.userData) bodyDef.userData = entityDef.userData;
    if(entityDef.angularDamping) bodyDef.angularDamping = entityDef.angularDamping;

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

var PhysicsBody = (function() {

  var scale = 0.1;
  var invScale = 1 / scale;

  var Vec2 = Box2D.Common.Math.b2Vec2;

  function tob2Vec2(v, scale) {
    scale = scale || 1;
    return new Vec2(v.x * scale, v.y * scale);
  }

  function to3Vector3(v, scale) {
    scale = scale || 1;
    return new THREE.Vector3(v.x * scale, v.y * scale, 0);
  }

  function PhysicsBody(entityDef) {
    entityDef.x *= scale;
    entityDef.y *= scale;
    entityDef.radius *= scale;
    this.body = PhysicsManager.addBody(entityDef);
    this.pos = new Vec2(entityDef.x, entityDef.y);
  }

  PhysicsBody.prototype = {
    applyImpulse: function(impulse, point) {
      impulse = tob2Vec2(impulse, scale);
      point = !!point ? toB2Vec2(point, scale) : new Vec2();
      this.body.ApplyImpulse(impulse, point);
    },

    applyForce: function(force, point) {
      force = tob2Vec2(force, scale);
      point = !!point ? toB2Vec2(point, scale) : this.body.GetPosition();
      this.body.ApplyForce(force, point);
    },

    teleport: function(position) {
      this.body.SetPosition(tob2Vec2(position, scale));
    },

    clearForces: function() {
      this.body.SetLinearVelocity(new Vec2());
      this.body.SetAngularVelocity(0);
    },

    setAngle: function(angle) {
      this.body.SetAngle(angle);
    },

    positionObject: function(object) {
      var pos = this.body.GetPosition();
      this.pos.SetV(pos);
      if(Math.abs(pos.x * invScale) > innerWidth/2) pos.x *= -0.99;
      if(Math.abs(pos.y * invScale) > innerHeight/2) pos.y *= -0.99;
      this.body.SetPosition(pos);
      object.position.copy(to3Vector3(pos, invScale));
    },

    motion: function() {
      var pos = new Vec2();
      pos.SetV(this.body.GetPosition());
      pos.Subtract(this.pos);
      console.log(pos, this.body.GetPosition(), this.pos, to3Vector3(pos, invScale));
      return to3Vector3(pos, invScale);
    },

    remove: function() {
      PhysicsManager.removeBody(this.body);
    }
  };

  return PhysicsBody;

}());

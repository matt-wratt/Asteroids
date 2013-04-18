var collisionGroups = {
  player: 0x0001 << 1,
  asteroid: 0x0001 << 2,
  projectile: 0x0001 << 3,
  all: 0xffff
};

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

  PhysicsManager.prototype = {
    addContactListener: function (callbacks) {
      var listener = new Box2D.Dynamics.b2ContactListener();

      if(callbacks.PostSolve) listener.PostSolve = function (contact, impulse) {
          callbacks.PostSolve(contact.GetFixtureA().GetBody(),
                              contact.GetFixtureB().GetBody(),
                              impulse.normalImpulses[0]);
      };

      this.world.SetContactListener(listener);
    },

    addBody: function(entityDef) {
      var bodyDef = new BodyDef();

      bodyDef.position.Set(entityDef.x, entityDef.y);

      if(entityDef.userData) bodyDef.userData = entityDef.userData;
      if(entityDef.angularDamping) bodyDef.angularDamping = entityDef.angularDamping;
      if(entityDef.bullet) bodyDef.bullet = entityDef.bullet;

      bodyDef.type = Body.b2_dynamicBody;

      var body = this.registerBody(bodyDef);

      var fixtureDefinition = new FixtureDef();

      fixtureDefinition.density = 1.0;
      fixtureDefinition.friction = 0;
      fixtureDefinition.restitution = 1.0;

      fixtureDefinition.shape = new CircleShape();
      fixtureDefinition.shape.SetRadius(entityDef.radius);

      fixtureDefinition.filter.categories = 0x0000;
      fixtureDefinition.filter.categoryBits |= collisionGroups[entityDef.group || 'all'];
      fixtureDefinition.filter.maskBits = 0x0000;
      for(var i = 0; i < entityDef.hits.length; ++i) {
        fixtureDefinition.filter.maskBits |= collisionGroups[entityDef.hits[i]];
      }

      body.CreateFixture(fixtureDefinition);

      return body;
    },

    registerBody: function(bodyDef) {
      var body = this.world.CreateBody(bodyDef);
      return body;
    },

    update: function() {
      var start = Date.now();

      this.world.Step(this.PHYSICS_LOOP_HZ, 10, 10);
      this.world.ClearForces();

      return(Date.now() - start);
    },

    removeBody: function(obj) {
      this.world.DestroyBody(obj);
    }
  };

  return PhysicsManager;

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
    this.body = Game.physics.addBody(entityDef);
    this.pos = new Vec2(entityDef.x, entityDef.y);
  }

  PhysicsBody.prototype = {
    applyImpulse: function(impulse, point) {
      impulse = tob2Vec2(impulse, scale);
      point = !!point ? toB2Vec2(point, scale) : this.body.GetPosition();
      this.body.ApplyImpulse(impulse, point);
    },

    applyForce: function(force, point) {
      force = tob2Vec2(force, scale);
      point = !!point ? toB2Vec2(point, scale) : this.body.GetPosition();
      this.body.ApplyForce(force, point);
    },

    applyTorque: function(torque) {
      this.body.ApplyTorque(torque);
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
      var x, y;
      var pos = this.body.GetPosition();
      this.pos.SetV(pos);
      pos = to3Vector3(pos, invScale);
      if((x = Math.abs(pos.x)) > innerWidth/2) pos.x -= (x / pos.x) * innerWidth;
      if((y = Math.abs(pos.y)) > innerHeight/2) pos.y -= (y / pos.y) * innerHeight;
      this.body.SetPosition(tob2Vec2(pos, scale));
      object.position.copy(pos);
      object.rotation.z = this.body.GetAngle();
    },

    motion: function() {
      var pos = new Vec2();
      pos.SetV(this.body.GetPosition());
      pos.Subtract(this.pos);
      return to3Vector3(pos, invScale);
    },

    remove: function() {
      Game.physics.removeBody(this.body);
    },

    pullTo: function(physBody, g) {
      g = g || 500;
      var direction = physBody.body.GetPosition().Copy();
      direction.Subtract(this.body.GetPosition().Copy());
      var distance = direction.Normalize();
      direction.Multiply(g * physBody.body.GetMass() / Math.pow(distance, 2));
      this.applyForce(direction);
    },

    velocity: function() {
      return to3Vector3(this.body.GetLinearVelocity(), invScale);
    }
  };

  return PhysicsBody;

}());

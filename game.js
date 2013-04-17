var Game = (function() {

  window.asteroidKillCount = 0;

  var MENU = 'menu';
  var NEW_GAME = 'new-game';
  var GAME = 'game';
  var END_GAME = 'end-game';

  function Game() {
    SoundManager.loadAsync('sounds/alert.wav');
    SoundManager.loadAsync('sounds/asteroid_die.wav');
    SoundManager.loadAsync('sounds/die.wav');
    SoundManager.loadAsync('sounds/gun.wav');
    SoundManager.loadAsync('sounds/shield.wav');
    SoundManager.loadAsync('sounds/spawn.wav');
    SoundManager.loadAsync('sounds/thrust.wav');
  }

  Game.prototype = {
    init: function() {
      this.entities = new ManagedArray();
      this.particles = new ParticleSystem();
      this.physics = new PhysicsManager();

      this.init3DStuff();
      this.inputs = new InputManager();
      this.bindKeys();
      this.state = MENU;
      this.asteroidCount = 1;
      this.asteroidSpeed = 10;

      this.physics.addContactListener({
        PostSolve: function (bodyA, bodyB, impulse) {
          var uA = bodyA ? bodyA.GetUserData() : null;
          var uB = bodyB ? bodyB.GetUserData() : null;

          if (uA !== null) {
            if (uA.ent !== null && uA.ent.onTouch) {
              uA.ent.onTouch(bodyB, null, impulse);
            }
          }

          if (uB !== null) {
            if (uB.ent !== null && uB.ent.onTouch) {
              uB.ent.onTouch(bodyA, null, impulse);
            }
          }
        }
      });

      this.animate = bind(this.animate, this);
      requestAnimationFrame(this.animate);
    },

    bindKeys: function() {
      this.inputs.bind(38, 'thrust');
      this.inputs.bind(39, 'right');
      this.inputs.bind(37, 'left');
      this.inputs.bind(32, 'action1');
      this.inputs.bind(16, 'action2');
      this.inputs.bind(40, 'action3');
    },

    newScene: function() {
      this.scene = new THREE.Scene();

      ambientLight = new THREE.AmbientLight( 0xffffff );
      this.scene.add(ambientLight);

      light = new THREE.DirectionalLight( 0xffffff, 0.7 );
      light.position.set( -800, 900, 300 );
      this.scene.add(light);

      this.particles.init();
    },

    init3DStuff: function() {
      var width = innerWidth;
      var height = innerHeight;
      //this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
      this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 2000 );
      this.camera.position.z = 1000;

      this.newScene();

      this.renderer = new THREE.WebGLRenderer({antialias: true, clearColor: 0x000000, clearAlpha: 1});
      // this.renderer = new THREE.CanvasRenderer({clearColor: 0x111111, clearAlpha: 1});
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      self = this;
      window.addEventListener('resize', function resize() {
        self.camera.aspect = window.innerWidth / window.innerHeight;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize(window.innerWidth, window.innerHeight);
      });
    },

    animate: function() {
      requestAnimationFrame(this.animate);
      switch(this.state) {
        case MENU:
          this.animateMenu();
          break;
        case NEW_GAME:
          this.animateNewGame();
          break;
        case GAME:
          this.animateGame();
          break;
        case END_GAME:
          this.animateEndGame();
          break;
      }
      this.renderer.render(this.scene, this.camera);
    },

    animateMenu: function() {
      if(!this.menuAnimated) {
        this.menuAnimated = true;
        menu.style.display = 'block';
        var self = this;
        newGame.addEventListener('click', function() {
          self.state = NEW_GAME;
          self.menuAnimated = false;
          menu.style.display = 'none';
          self.inputs.clearKeys();
          document.body.appendChild(self.renderer.domElement);
          // if(self.renderer.domElement.webkitRequestFullScreen) {
          //   self.renderer.domElement.webkitRequestFullScreen();
          // }
        });
      }
    },

    lost: function() {
      this.state = END_GAME;
    },

    won: function() {
      this.asteroidCount += 1;
      this.asteroidSpeed *= 1.3;
      this.state = NEW_GAME;
    },

    animateNewGame: function() {
      this.entities.clear();
      this.newScene();
      this.entities.add(this.physics);
      this.player = new Player();
      this.map = new Map(this.asteroidCount, this.asteroidSpeed);
      this.state = GAME;
    },

    animateGame: function() {
      this.entities.each(function(entity) { entity.update(); });
      this.processInputs();
      if(this.map.complete()) this.won();
    },

    processInputs: function() {
      if(this.inputs.actions.thrust) this.player.thrust();
      if(this.inputs.actions.right) this.player.right();
      if(this.inputs.actions.left) this.player.left();
      if(this.inputs.actions.action1) this.player.action1();
      if(this.inputs.actions.action2) this.player.action2();
      if(this.inputs.actions.action3) this.player.action3();
    },

    animateEndGame: function() {
      if(!this.gameEnded) {
        SoundManager.stopAll();
        this.gameEnded = true;
        this.entities.clear();
        this.newScene();
        document.body.removeChild(this.renderer.domElement);
        killCount.innerText = asteroidKillCount;
        endGame.style.display = "block";
        this.asteroidCount = 1;
        this.asteroidSpeed = 10;
        this.player = null;
        self = this;
        setTimeout(function() {
          asteroidKillCount = 0;
          self.gameEnded = false;
          endGame.style.display = 'none';
          self.state = MENU;
        }, 3000);
      }
    }
  };

  return new Game;

}());

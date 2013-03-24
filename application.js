var Application = (function() {

  var MENU = 'menu';
  var NEW_GAME = 'new-game';
  var GAME = 'game';
  var END_GAME = 'end-game';

  function Application() {
    this.entities = [];
    this.init3DStuff();
    this.inputManager = new InputManager();
    this.bindKeys();
    this.state = NEW_GAME;
    this.animate = bind(this.animate, this);
    requestAnimationFrame(this.animate);
  }

  Application.prototype.bindKeys = function() {
    this.inputManager.bind(38, 'thrust');
    this.inputManager.bind(39, 'rotate_right');
    this.inputManager.bind(40, 'brake');
    this.inputManager.bind(37, 'rotate_left');
    this.inputManager.bind(32, 'guns_guns_guns');
  };

  Application.prototype.init3DStuff = function() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    this.camera.position.z = 1000;

    this.scene = new THREE.Scene();

    ambientLight = new THREE.AmbientLight( 0xffffff );
    this.scene.add(ambientLight);

    light = new THREE.DirectionalLight( 0xffffff, 0.7 );
    light.position.set( -800, 900, 300 );
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({antialias: true, clearColor: 0x111111, clearAlpha: 1});
    // this.renderer = new THREE.CanvasRenderer({clearColor: 0x111111, clearAlpha: 1});
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    self = this;
    window.addEventListener('resize', function resize() {
      self.camera.aspect = window.innerWidth / window.innerHeight;
      self.camera.updateProjectionMatrix();
      self.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.body.appendChild(this.renderer.domElement);
  };

  Application.prototype.animate = function() {
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
    this.updateEntities();
    this.renderer.render(this.scene, this.camera);
  };

  Application.prototype.updateEntities = function() {
    for(var i = 0; i < this.entities.length; ++i) {
      this.entities[i].update(this.inputManager);
    }
  };

  Application.prototype.animateNewGame = function() {
    this.entities.length = 0;
    this.map = new Map();
    this.player = new Player(this.entities);
    this.player.addTo(this.scene);
    this.state = GAME;
  };

  Application.prototype.animateGame = function() {
  };

  Application.prototype.animateEndGame = function() {
  };

  return Application;

}());

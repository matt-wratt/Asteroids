var Application = (function() {

  var MENU = 'menu';
  var NEW_GAME = 'new-game';
  var GAME = 'game';
  var END_GAME = 'end-game';

  function Application() {
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
    this.inputManager.bind(87, 'shoot_forwards');
    this.inputManager.bind(68, 'shoot_right');
    this.inputManager.bind(83, 'shoot_backwards');
    this.inputManager.bind(65, 'shoot_left');
  };

  Application.prototype.init3DStuff = function() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 200;

    this.scene = new THREE.Scene();

    ambientLight = new THREE.AmbientLight( 0xffffff );
    this.scene.add(ambientLight);

    light = new THREE.DirectionalLight( 0xffffff, 0.7 );
    light.position.set( -800, 900, 300 );
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({antialias: true, clearColor: 0x888888, clearAlpha: 1});
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
    this.renderer.render(this.scene, this.camera);
  };

  Application.prototype.animateNewGame = function() {
    this.map = new Map();
    this.player = new Player();
    this.scene.add(this.player.ship);
    this.state = GAME;
  };

  Application.prototype.animateGame = function() {
    this.player.update(this.inputManager.actions);
    if(this.inputManager.actions.thrust) console.log('thrust');
    if(this.inputManager.actions.rotate_right) console.log('rotate_right');
    if(this.inputManager.actions.brake) console.log('brake');
    if(this.inputManager.actions.rotate_left) console.log('rotate_left');
    if(this.inputManager.actions.shoot_forwards) console.log('shoot_forwards');
    if(this.inputManager.actions.shoot_right) console.log('shoot_right');
    if(this.inputManager.actions.shoot_backwards) console.log('shoot_backwards');
    if(this.inputManager.actions.shoot_left) console.log('shoot_left');
  };

  Application.prototype.animateEndGame = function() {
  };

  return Application;

}());

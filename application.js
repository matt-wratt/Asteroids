var Application = (function() {

  window.asteroidKillCount = 0;

  var MENU = 'menu';
  var NEW_GAME = 'new-game';
  var GAME = 'game';
  var END_GAME = 'end-game';

  function Application() {
    this.entities = [];
    this.init3DStuff();
    this.inputManager = new InputManager();
    this.bindKeys();
    this.state = MENU;
    this.asteroidCount = 1;
    this.asteroidSpeed = 10;
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

  Application.prototype.newScene = function() {
    this.scene = new THREE.Scene();

    ambientLight = new THREE.AmbientLight( 0xffffff );
    this.scene.add(ambientLight);

    light = new THREE.DirectionalLight( 0xffffff, 0.7 );
    light.position.set( -800, 900, 300 );
    this.scene.add(light);
  };

  Application.prototype.init3DStuff = function() {
    var width = innerWidth;
    var height = innerHeight;
    //this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
    this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
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

  Application.prototype.animateMenu = function() {
    if(!this.menuAnimated) {
      this.menuAnimated = true;
      menu.style.display = 'block';
      var self = this;
      newGame.addEventListener('click', function() {
        self.state = NEW_GAME;
        self.menuAnimated = false;
        menu.style.display = 'none';
        self.inputManager.clearKeys();
        document.body.appendChild(self.renderer.domElement);
        self.renderer.domElement.webkitRequestFullScreen();
      });
    }
  };

  Application.prototype.playerDied = function() {
    this.state = END_GAME;
  };

  Application.prototype.playerWon = function() {
    this.asteroidCount += 1;
    this.asteroidSpeed *= 1.3;
    this.state = NEW_GAME;
  };

  Application.prototype.animateNewGame = function() {
    this.entities.length = 0;
    this.newScene();
    this.player = new Player(this, this.entities);
    this.player.addTo(this.scene);
    this.map = new Map(this.player, this.asteroidCount, this.asteroidSpeed);
    this.map.addTo(this.scene);
    this.entities.push(this.map);
    this.state = GAME;
  };

  Application.prototype.animateGame = function() {
  };

  Application.prototype.animateEndGame = function() {
    if(!this.gameEnded) {
      this.gameEnded = true;
      this.entities.length = 0;
      this.newScene();
      document.body.removeChild(this.renderer.domElement);
      killCount.innerText = asteroidKillCount
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
  };

  return Application;

}());

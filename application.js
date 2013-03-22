var Application = (function() {

  var MENU = 'menu';
  var NEW_GAME = 'new-game';
  var GAME = 'game';
  var END_GAME = 'end-game';

  function Application() {
    this.canvas = this.createCanvas();
    this.inputManager = new InputManager();
    this.bindKeys();
    this.state = NEW_GAME;
    requestAnimationFrame(this.animate);
  }

  Application.prototype.bindKeys = function() {
    this.inputManager.bind(87, 'shoot-forwards');
    this.inputManager.bind(68, 'shoot-right');
    this.inputManager.bind(83, 'shoot-down');
    this.inputManager.bind(65, 'shoot-left');
  };

  Application.prototype.createCanvas = function() {
    canvas = document.createElement('canvas');
    canvas.setAttribute('width', innerWidth);
    canvas.setAttribute('height', innerHeight);
    addEventListener('resize', function() {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    });
    return canvas;
  };

  Application.prototype.animate = function() {
    requestAnimationFrame(this.animate);
  };

  return Application;

}());

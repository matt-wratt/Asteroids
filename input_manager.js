var InputManager = (function() {

  function InputManager() {
    this.bindings = {};
    this.actions = {};
    this.onKeyDown = bind(this.onKeyDown, this);
    this.onKeyUp = bind(this.onKeyUp, this);
    addEventListener('keydown', this.onKeyDown)
    addEventListener('keyup', this.onKeyUp)
  }

  InputManager.prototype.bind = function(keyCode, action) {
    this.bindings[keyCode] = action;
    this.actions[action] = false;
  };

  InputManager.prototype.onKeyDown = function(event) {
    event.preventDefault();
    this.actions[this.bindings[event.keyCode]] = true;
  };

  InputManager.prototype.onKeyUp = function(event) {
    event.preventDefault();
    this.actions[this.bindings[event.keyCode]] = false;
  };

  InputManager.prototype.clearKeys = function() {
    for(var i in this.actions) {
      this.actions[i] = false;
    }
  };

  return InputManager;

}());

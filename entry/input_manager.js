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
    var action = this.bindings[event.keyCode];
    if(action) {
      event.preventDefault();
      this.actions[action] = true;
    }
  };

  InputManager.prototype.onKeyUp = function(event) {
    var action = this.bindings[event.keyCode];
    if(action) {
      event.preventDefault();
      this.actions[action] = false;
    }
  };

  InputManager.prototype.clearKeys = function() {
    for(var i in this.actions) {
      this.actions[i] = false;
    }
  };

  return InputManager;

}());

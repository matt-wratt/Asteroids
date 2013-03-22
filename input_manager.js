var InputManager = (function() {

  function bind(func, owner) {
    return (function(func, owner) {
      return function() {
        return func.apply(owner, arguments);
      }
    }(func, owner));
  }

  function InputManager() {
    this.bindings = {};
    this.actions = {};
    addEventListener('keydown', this.onKeyDown)
    addEventListener('keyup', this.onKeyUp)
    this.onKeyDown = bind(this.onKeyDown, this);
    this.onKeyUp = bind(this.onKeyUp, this);
  }

  InputManager.prototype.bind = function(keyCode, action) {
    this.bindings[keyCode] = action;
    this.actions[action] = false;
  };

  InputManager.prototype.onKeyDown = function(event) {
    this.actions[this.bindings[event.keyCode]] = true;
  };

  InputManager.prototype.onKeyUp = function(event) {
    this.actions[this.bindings[event.keyCode]] = false;
  };

  return InputManager;

}());
